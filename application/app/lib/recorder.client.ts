export class AudioRecorder {
  private mediaBlobs: Blob[] = [];
  private stopPromise: Promise<Blob> | null = null;
  private mediaRecorder: MediaRecorder | null = null;

  constructor() {}

  async start() {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    const mediaRecorder = new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener("dataavailable", (e) => {
      this.mediaBlobs.push(e.data);
    });

    const stopPromise = new Promise<Blob>((r) => {
      mediaRecorder.addEventListener("stop", () => {
        console.log("Calling stop event");
        r(new Blob(this.mediaBlobs));
      });
    });

    this.stopPromise = stopPromise;

    mediaRecorder.start();
    this.mediaRecorder = mediaRecorder;
  }

  async stop() {
    const promise = this.stopPromise;
    const mediaRecorder = this.mediaRecorder;

    if (!promise || !mediaRecorder) {
      throw new Error(
        "AudioRecorder.start should be called before calling AudioRecorder.stop",
      );
    }

    mediaRecorder.stop();

    return promise;
  }
}
