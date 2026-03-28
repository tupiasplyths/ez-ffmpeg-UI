use regex::Regex;
use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::{process::CommandEvent, ShellExt};

fn parse_duration(text: &str) -> Option<f64> {
    let re = Regex::new(r"Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})").ok()?;
    let caps = re.captures(text)?;
    let h: f64 = caps.get(1)?.as_str().parse().ok()?;
    let m: f64 = caps.get(2)?.as_str().parse().ok()?;
    let s: f64 = caps.get(3)?.as_str().parse().ok()?;
    let ms: f64 = format!("0.{}", caps.get(4)?.as_str()).parse().ok()?;
    Some(h * 3600.0 + m * 60.0 + s + ms)
}

fn parse_current_time(text: &str) -> Option<f64> {
    let re = Regex::new(r"time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})").ok()?;
    let caps = re.captures(text)?;
    let h: f64 = caps.get(1)?.as_str().parse().ok()?;
    let m: f64 = caps.get(2)?.as_str().parse().ok()?;
    let s: f64 = caps.get(3)?.as_str().parse().ok()?;
    let ms: f64 = format!("0.{}", caps.get(4)?.as_str()).parse().ok()?;
    Some(h * 3600.0 + m * 60.0 + s + ms)
}

#[tauri::command]
pub async fn convert_file(app: AppHandle, input: String, output: String) -> Result<(), String> {
    let sidecar = app
        .shell()
        .sidecar("ffmpeg")
        .map_err(|e| e.to_string())?
        .args(["-y", "-i", &input, &output]);

    let (mut rx, _child) = sidecar.spawn().map_err(|e| e.to_string())?;

    tauri::async_runtime::spawn(async move {
        let mut duration: Option<f64> = None;

        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stderr(line) => {
                    let text = String::from_utf8_lossy(&line);

                    if duration.is_none() {
                        if let Some(dur) = parse_duration(&text) {
                            duration = Some(dur);
                        }
                    }

                    if let (Some(current), Some(dur)) = (parse_current_time(&text), duration) {
                        let progress = ((current / dur) * 100.0).min(100.0) as u32;
                        let _ = app.emit("conversion-progress", progress);
                    }
                }
                CommandEvent::Terminated(status) => {
                    if status.code == Some(0) {
                        let _ = app.emit("conversion-done", ());
                    } else {
                        let _ = app.emit(
                            "conversion-error",
                            format!("FFmpeg exited with code {:?}", status.code),
                        );
                    }
                }
                CommandEvent::Error(err) => {
                    let _ = app.emit("conversion-error", err);
                }
                _ => {}
            }
        }
    });

    Ok(())
}
