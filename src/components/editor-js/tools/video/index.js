import "./video-tool.css";

export class VideoTool {
  static get toolbox() {
    return {
      title: "Video",
      icon: `
        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.5 9V15M6.5 12H12.5M16 10L18.5768 8.45392C19.3699 7.97803 19.7665 7.74009 20.0928 7.77051C20.3773 7.79703 20.6369 7.944 20.806 8.17433C21 8.43848 21 8.90095 21 9.8259V14.1741C21 15.099 21 15.5615 20.806 15.8257C20.6369 16.056 20.3773 16.203 20.0928 16.2295C19.7665 16.2599 19.3699 16.022 18.5768 15.5461L16 14M6.2 18H12.8C13.9201 18 14.4802 18 14.908 17.782C15.2843 17.5903 15.5903 17.2843 15.782 16.908C16 16.4802 16 15.9201 16 14.8V9.2C16 8.0799 16 7.51984 15.782 7.09202C15.5903 6.71569 15.2843 6.40973 14.908 6.21799C14.4802 6 13.9201 6 12.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V14.8C3 15.9201 3 16.4802 3.21799 16.908C3.40973 17.2843 3.71569 17.5903 4.09202 17.782C4.51984 18 5.07989 18 6.2 18Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
    };
  }

  constructor({ data }) {
    this.data = data;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("simple-video");

    if (this.data && this.data.url) {
      this._createVideo(this.data.url, this.data);
      return this.wrapper;
    }

    this._createVideoImporter();
    return this.wrapper;
  }

  _createVideoImporter() {
    const inputBox = document.createElement("div");
    inputBox.classList.add("input-box-video");

    const embedInputWrapper = document.createElement("div");
    embedInputWrapper.classList.add("input-wrapper", "embed-wrapper");

    const embedInput = document.createElement("input");
    embedInput.placeholder = "Paste the video link...";

    const embedButton = document.createElement("button");
    embedButton.textContent = "Embed video";
    embedButton.addEventListener("click", () => {
      this._createVideo(embedInput.value);
    });

    // Also allow Enter key to embed
    embedInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this._createVideo(embedInput.value);
      }
    });

    embedInputWrapper.appendChild(embedInput);
    embedInputWrapper.appendChild(embedButton);

    inputBox.appendChild(embedInputWrapper);
    this.wrapper.appendChild(inputBox);
  }

  _createVideo(url, data = {}) {
    this.wrapper.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add("video-container");

    // Convert YouTube URLs to embed format
    const embedUrl = this._convertToEmbedUrl(url);

    // Use iframe with minimal restrictions for Electron
    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;

    // Set container and iframe dimensions
    if (data.width && data.height) {
      container.style.width = `${data.width}px`;
      container.style.height = `${data.height}px`;
      container.dataset.width = data.width;
      container.dataset.height = data.height;
    } else {
      // Set default dimensions - max-width for responsiveness
      container.style.width = "100%";
      container.style.height = "400px";
    }

    // Iframe should always fill the container
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.frameBorder = "0";

    // Minimal attributes for maximum compatibility in Electron
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;

    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");

    container.appendChild(iframe);
    container.appendChild(resizeHandle);
    this.wrapper.appendChild(container);

    this._addResizeFunctionality(container, iframe);
  }

  /**
   * Convert various video URLs to embed format
   */
  _convertToEmbedUrl(url) {
    try {
      let videoId = null;

      // YouTube share link (youtu.be)
      if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (match && match[1]) {
          videoId = match[1];
        }
      }
      // YouTube watch link
      else if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
      }
      // YouTube embed URL (already in correct format)
      else if (url.includes('youtube.com/embed/')) {
        return url;
      }

      // If we found a YouTube video ID, create proper embed URL with parameters
      if (videoId) {
        // Use youtube-nocookie.com which is less restrictive for Electron
        // autoplay=0: Don't autoplay
        // controls=1: Show controls
        // modestbranding=1: Minimal YouTube branding
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&modestbranding=1`;
      }

      // Vimeo
      if (url.includes('vimeo.com/')) {
        const match = url.match(/vimeo\.com\/(\d+)/);
        if (match && match[1]) {
          return `https://player.vimeo.com/video/${match[1]}`;
        }
      }

      // Already an embed URL or other URL
      return url;
    } catch (error) {
      console.error('Error parsing video URL:', error);
      return url;
    }
  }

  _addResizeFunctionality(container, iframe) {
    const resizeHandle = container.querySelector(".resize-handle");

    let isResizing = false;

    resizeHandle.addEventListener("mousedown", (e) => {
      isResizing = true;

      const initialWidth = container.offsetWidth;
      const initialHeight = container.offsetHeight;
      const initialX = e.clientX;
      const initialY = e.clientY;

      const onMouseMove = (e) => {
        if (isResizing) {
          const width = initialWidth + (e.clientX - initialX);
          const height = initialHeight + (e.clientY - initialY);

          container.style.width = `${width}px`;
          container.style.height = `${height}px`;
          container.dataset.width = width;
          container.dataset.height = height;

          iframe.style.width = "100%";
          iframe.style.height = "100%";
        }
      };

      const onMouseUp = () => {
        isResizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  save(blockContent) {
    const container = blockContent.querySelector(".video-container");

    if (!container) {
      // Return empty data if no video has been added yet
      return {};
    }

    const iframe = container.querySelector("iframe");

    if (!iframe || !iframe.src) {
      return {};
    }

    return {
      url: iframe.src,
      width: container.dataset.width || String(container.offsetWidth),
      height: container.dataset.height || String(container.offsetHeight)
    };
  }
}
