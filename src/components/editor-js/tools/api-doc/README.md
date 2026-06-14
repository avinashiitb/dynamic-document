# API Documentation Tool

A modular, class-based API documentation and testing tool for Editor.js with advanced CodeMirror integration featuring code folding and auto bracket closing.

## 📁 Project Structure

```
api-doc/
├── README.md                    # This documentation file
├── index.js                     # Main export (3 lines)
├── api-doc.css                  # Styling for the tool
├── core/                        # Core functionality
│   ├── ApiDocumentTool.js       # Main orchestrator class (110 lines)
│   └── codemirror-imports.js    # CodeMirror configuration (25 lines)
├── services/                    # Business logic services
│   ├── EnvironmentManager.js    # Environment variable management (85 lines)
│   └── ApiRequestService.js     # API request execution (165 lines)
├── utils/                       # Utility classes
│   └── CodeMirrorManager.js     # Code editor management (95 lines)
├── ui/                          # User interface components
│   ├── UIRenderer.js            # UI coordination (55 lines)
│   └── UITemplates.js           # HTML template generation (240 lines)
└── events/                      # Event handling
    ├── EventManager.js          # Event coordination (230 lines)
    ├── FormHandlers.js          # Form interaction handling (240 lines)
    └── PopupHandlers.js         # Popup management (65 lines)
```

## 🏗️ Architecture Overview

### Class Hierarchy and Responsibilities

```
ApiDocumentTool (Main Orchestrator)
├── EnvironmentManager (Environment Variables)
├── ApiRequestService (API Execution)
├── UIRenderer (UI Coordination)
│   └── UITemplates (HTML Generation)
├── EventManager (Event Coordination)
│   ├── FormHandlers (Form Interactions)
│   └── PopupHandlers (Popup Management)
└── CodeMirrorManager (Code Editors)
```

## 📋 File Descriptions

### Core Files

#### `index.js`

- **Purpose**: Simple export wrapper
- **Size**: 3 lines
- **Function**: Exports the main `ApiDocumentTool` class

#### `core/ApiDocumentTool.js`

- **Purpose**: Main orchestrator class
- **Size**: 110 lines
- **Responsibilities**:
  - Initialize all manager classes
  - Coordinate between different components
  - Handle Editor.js lifecycle methods (`render()`, `save()`)
  - Manage data structure and state

#### `core/codemirror-imports.js`

- **Purpose**: Centralized CodeMirror configuration
- **Size**: 25 lines
- **Features**:
  - Code folding addons
  - Auto bracket closing
  - Syntax highlighting
  - Theme configuration

### Service Layer

#### `services/EnvironmentManager.js`

- **Purpose**: Environment variable management
- **Size**: 85 lines
- **Responsibilities**:
  - Fetch environment variables from database
  - Save new environment configurations
  - Update environment dropdowns
  - Extract paths from URLs

#### `services/ApiRequestService.js`

- **Purpose**: API request execution and management
- **Size**: 165 lines
- **Responsibilities**:
  - Build cURL commands from request data
  - Execute API requests via IPC
  - Parse API responses
  - Handle different authentication types
  - Manage query parameters

### Utility Layer

#### `utils/CodeMirrorManager.js`

- **Purpose**: Code editor management
- **Size**: 95 lines
- **Responsibilities**:
  - Initialize CodeMirror editors
  - Configure folding and bracket features
  - Manage editor lifecycle
  - Handle editor content updates

### UI Layer

#### `ui/UIRenderer.js`

- **Purpose**: UI coordination and updates
- **Size**: 55 lines
- **Responsibilities**:
  - Coordinate UI rendering
  - Update response displays
  - Manage UI state changes

#### `ui/UITemplates.js`

- **Purpose**: HTML template generation
- **Size**: 240 lines
- **Responsibilities**:
  - Generate main UI template
  - Create form sections (params, query, headers, etc.)
  - Build popup templates
  - Manage responsive layouts

### Event Layer

#### `events/EventManager.js`

- **Purpose**: Event coordination and delegation
- **Size**: 230 lines
- **Responsibilities**:
  - Setup all event listeners
  - Coordinate between different event handlers
  - Manage method cycling
  - Handle environment selection
  - Control section toggling

#### `events/FormHandlers.js`

- **Purpose**: Form interaction management
- **Size**: 240 lines
- **Responsibilities**:
  - Handle parameter forms (params, query, headers)
  - Manage authentication forms
  - Process form submissions
  - Execute API requests

#### `events/PopupHandlers.js`

- **Purpose**: Popup management
- **Size**: 65 lines
- **Responsibilities**:
  - Handle environment creation popup
  - Manage popup lifecycle
  - Process popup form submissions

## 🔄 Application Flow

### 1. Initialization Flow

```mermaid
graph TD
    A[Editor.js creates ApiDocumentTool] --> B[Constructor initializes managers]
    B --> C[EnvironmentManager]
    B --> D[ApiRequestService]
    B --> E[UIRenderer]
    B --> F[EventManager]
    B --> G[CodeMirrorManager]
    H[render() called] --> I[Create DOM container]
    I --> J[UIRenderer.render() with empty env]
    J --> K[EventManager.setupEventListeners()]
    K --> L[Background: EnvironmentManager.fetchEnvironmentVariables()]
    L --> M[Update environment dropdown]
    M --> N[Re-attach environment event listeners]
```

### 2. User Interaction Flow

```mermaid
graph TD
    A[User clicks method button] --> B[EventManager.setupMethodCycling()]
    B --> C[Update method in data]
    C --> D[Update UI button]

    E[User selects environment] --> F[EventManager.setupEnvironmentHandlers()]
    F --> G[EnvironmentManager.extractPathFromUrl()]
    G --> H[Update URL input]

    I[User clicks Send] --> J[FormHandlers.setupSendButtonHandler()]
    J --> K[ApiRequestService.executeRequest()]
    K --> L[Build cURL command]
    L --> M[Execute via IPC]
    M --> N[Parse response]
    N --> O[Update UI with response]
```

### 3. CodeMirror Integration Flow

```mermaid
graph TD
    A[User opens toggle section] --> B[EventManager.setupToggleHandlers()]
    B --> C[CodeMirrorManager.initializeResponseEditor()]
    C --> D[Create CodeMirror instance]
    D --> E[Configure folding & brackets]
    E --> F[Attach to DOM]
    F --> G[Setup event prevention]

    H[User clicks Body tab] --> I[EventManager.setupTabHandlers()]
    I --> J[CodeMirrorManager.initializeRequestEditor()]
    J --> K[Setup change listeners]
    K --> L[Update data on changes]
```

## 🎯 Key Features

### CodeMirror Features

- ✅ **Code Folding**: Click fold icons to collapse/expand code blocks
- ✅ **Auto Bracket Closing**: Automatic closing of brackets, quotes, parentheses
- ✅ **Bracket Matching**: Highlight matching brackets when cursor is positioned
- ✅ **Line Numbers**: Display line numbers with fold gutters
- ✅ **Syntax Highlighting**: JSON syntax highlighting for API responses
- ✅ **Theme Support**: Eclipse theme with proper styling

### API Testing Features

- 🔄 **Method Selection**: Cycle through GET, POST, PUT, PATCH, DELETE
- 🌐 **Environment Management**: Add and select different base URLs
- 📝 **Request Configuration**:
  - Path parameters with placeholder replacement
  - Query parameters with URL auto-update
  - Custom headers
  - Authentication (Bearer Token, Basic Auth, API Key)
  - Request body with JSON editor
- 🚀 **API Execution**: Send requests and view formatted responses
- 📊 **Response Display**: JSON formatted responses with timing and status

## 🔧 Technical Implementation

### Design Patterns Used

1. **Single Responsibility Principle**: Each class has one clear purpose
2. **Dependency Injection**: Managers are injected into the main class
3. **Observer Pattern**: Event listeners coordinate between components
4. **Template Method**: UI templates are generated through template methods
5. **Factory Pattern**: Dynamic creation of form elements

### Error Handling

- **Service Layer**: Try-catch blocks with fallback responses
- **UI Layer**: Graceful degradation when elements are missing
- **Event Layer**: Event delegation with null checks
- **CodeMirror**: Defensive initialization with timeout fallbacks

### Performance Optimizations

- **Lazy Loading**: CodeMirror editors initialize only when needed
- **Async Operations**: Environment loading doesn't block UI render
- **Event Delegation**: Efficient event handling with minimal listeners
- **Template Caching**: HTML templates generated once and reused

## 🚀 Usage Examples

### Basic Usage

```javascript
import ApiDocumentTool from "./api-doc/index.js";

// Editor.js will automatically instantiate the tool
const editor = new EditorJS({
  tools: {
    apiDoc: ApiDocumentTool,
  },
});
```

### Configuration

```javascript
const editor = new EditorJS({
  tools: {
    apiDoc: {
      class: ApiDocumentTool,
      config: {
        fileId: "unique-file-id",
        defaultMethod: "POST",
        defaultAuth: "Bearer Token",
      },
    },
  },
});
```

## 🔍 Debugging Guide

### Common Issues

1. **CodeMirror not loading**: Check `codemirror-imports.js` for missing dependencies
2. **Events not working**: Verify event listeners are attached after DOM creation
3. **Environment not loading**: Check IPC communication and database connection
4. **API requests failing**: Verify cURL command generation in browser console

### Debug Points

- `ApiDocumentTool.constructor()`: Verify all managers initialize
- `EventManager.setupEventListeners()`: Check event attachment
- `CodeMirrorManager.initializeResponseEditor()`: Verify editor creation
- `ApiRequestService.executeRequest()`: Check request execution

## 📈 Future Enhancements

- [ ] Add request history
- [ ] Implement request collections
- [ ] Add response validation
- [ ] Support for GraphQL queries
- [ ] Export/import functionality
- [ ] Advanced authentication methods
- [ ] Request mocking capabilities

## 🤝 Contributing

When modifying this tool:

1. **Follow the modular structure**: Keep related functionality in appropriate folders
2. **Maintain single responsibility**: Each class should have one clear purpose
3. **Update this README**: Document any structural changes
4. **Test CodeMirror features**: Ensure folding and bracket closing work
5. **Verify Editor.js compatibility**: Test render() method returns DOM synchronously

---

_This tool was refactored from a monolithic 1000+ line file into a clean, modular architecture with proper separation of concerns and enhanced CodeMirror integration._
