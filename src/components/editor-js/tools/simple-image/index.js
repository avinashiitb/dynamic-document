export class SimpleImage {
  static get toolbox() {
    return {
      title: "Image",
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30zm0 52l-43-30-56 30-81-67-66 39v23c0 19 15 34 34 34h178c17 0 31-13 34-29zM79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z"/></svg>',
    };
  }

  constructor({ data }) {
    this.data = data;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.classList.add("simple-image");

    if (this.data && this.data.url) {
      this._createImage(this.data.url, this.data.caption, this.data);
      return this.wrapper;
    }
    this._createImageImporter();

    return this.wrapper;
  }

  _createImageImporter() {
    const inputBox = document.createElement("div");
    inputBox.classList.add("input-box-image");

    const tabs = document.createElement("div");
    tabs.classList.add("tabs");

    const embedLinkTab = this._createTab("Embed link");
    const uploadTab = this._createTab("Upload");

    tabs.append(embedLinkTab, uploadTab);

    inputBox.appendChild(tabs);

    const embedInputWrapper = document.createElement("div");
    embedInputWrapper.classList.add("input-wrapper", "embed-wrapper");

    const embedInput = document.createElement("input");
    embedInput.placeholder = "Paste the image link...";

    const embedButton = document.createElement("button");
    embedButton.textContent = "Embed image";
    embedButton.addEventListener("click", () => {
      this._createImage(embedInput.value);
    });

    embedInputWrapper.appendChild(embedInput);
    embedInputWrapper.appendChild(embedButton);

    const uploadInputWrapper = document.createElement("div");
    uploadInputWrapper.classList.add(
      "input-wrapper",
      "upload-wrapper",
      "hidden"
    );

    const uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "image/*";
    uploadInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        this._createImage(e.target.result);
      };
      reader.readAsDataURL(file);
    });

    uploadInputWrapper.appendChild(uploadInput);

    inputBox.appendChild(embedInputWrapper);
    inputBox.appendChild(uploadInputWrapper);

    this.wrapper.appendChild(inputBox);

    embedLinkTab.addEventListener("click", () => {
      this._toggleActiveTab(embedLinkTab, uploadTab);
      embedInputWrapper.classList.remove("hidden");
      uploadInputWrapper.classList.add("hidden");
    });

    uploadTab.addEventListener("click", () => {
      this._toggleActiveTab(uploadTab, embedLinkTab);
      embedInputWrapper.classList.add("hidden");
      uploadInputWrapper.classList.remove("hidden");
    });

    // Set initial active tab
    this._toggleActiveTab(embedLinkTab, uploadTab);
  }

  _createTab(title) {
    const tab = document.createElement("div");
    tab.classList.add("tab");
    tab.textContent = title;
    return tab;
  }

  _toggleActiveTab(activeTab, inactiveTab) {
    activeTab.classList.add("active");
    inactiveTab.classList.remove("active");
  }

  _createImage(url, captionText, data = {}) {
    this.wrapper.innerHTML = "";

    const container = document.createElement("div");
    container.classList.add("image-container");

    const image = document.createElement("img");
    image.src = url;

    if (data.width && data.height) {
      container.style.width = `${data.width}px`;
      container.style.height = `${data.height}px`;
      container.dataset.width = data.width;
      container.dataset.height = data.height;
    }

    const toolbar = document.createElement("div");
    toolbar.classList.add("toolbar");

    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    const deleteButton = document.createElement("button");
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';

    toolbar.appendChild(editButton);
    toolbar.appendChild(deleteButton);

    const resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");

    container.appendChild(toolbar);
    container.appendChild(image);
    container.appendChild(resizeHandle);

    this.wrapper.appendChild(container);

    this._addResizeFunctionality(container, image);
  }

  _addResizeFunctionality(container, image) {
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

          image.style.width = "100%";
          image.style.height = "100%";
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
    const container = blockContent.querySelector(".image-container");
    const image = container.querySelector("img");

    return {
      url: image.src,
      width: container.dataset.width,
      height: container.dataset.height,
    };
  }
}
