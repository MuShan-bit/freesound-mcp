# Freesound-MCP

A Model Context Protocol (MCP) server that enables AI applications to search and download audio resources from the [Freesound](https://freesound.org/) platform via natural language commands.

## Overview

Freesound-MCP is designed to simplify the integration of copyright-free sound resources into AI tools. It follows the Model Context Protocol standard and communicates with host applications via stdin/stdout. The server provides two main capabilities:

- 🔍 **Search Sounds**: Search for sounds by keywords with optional filters for maximum duration and license type
- ⬇️ **Download Sounds**: Download audio files by sound ID from Freesound
- 🎵 **Metadata Support**: Retrieve detailed information about sounds, including duration, license, and preview links

## Features

- Lightweight MCP server built with Node.js
- Standard input/output communication mechanism compliant with MCP protocol
- Secure API key management through environment variables
- No database required - simple, stateless design

## Prerequisites

- Node.js (supports CommonJS modules)
- npm or yarn package manager
- A Freesound API key (get one at [Freesound API page](https://freesound.org/docs/api/authentication.html))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/freesound-mcp.git
cd freesound-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Setup

1. Get your Freesound API key from [Freesound API page](https://freesound.org/docs/api/authentication.html)

2. Set your API key as an environment variable:
```bash
export FREESOUND_API_KEY=your_freesound_api_key_here
```

## Configuration in Claude Desktop

To configure this MCP server in Claude Desktop:

1. Open Claude Desktop preferences
2. Navigate to "Beta Features" → "Model Context Protocol (MCP) Tools"
3. Click "Configure" to manage MCP servers
4. Add a new server configuration with these details:
   - Name: "Freesound MCP"
   - Command: `node` 
   - Arguments: `/path/to/freesound-mcp/dist/index.js` (after running `npm run build`)
   - Environment Variables: Ensure `FREESOUND_API_KEY` is available to the process
5. Save the configuration and restart Claude

After restarting Claude, you'll be able to use the Freesound tools in your conversations.

## Usage

Once configured in Claude, you can use natural language commands such as:

- "Find me a rainforest ambient sound under 30 seconds"
- "Download sound #123456 as high quality"

### Available Tools

#### 1. Freesound Search (`freesound_search`)

Search for sounds on Freesound by providing keywords and optional filters.

Parameters:
- `query` (required): Search keywords
- `maxDuration` (optional): Maximum duration of sounds in seconds
- `license` (optional): License type of sounds to search for

Returns:
- Array of sound objects containing:
  - `id`: Sound ID
  - `name`: Sound name
  - `duration`: Sound duration in seconds
  - `license`: Sound license
  - `preview`: Sound preview URL

#### 2. Freesound Download (`freesound_download`)

Download a sound from Freesound by sound ID.

Parameters:
- `soundId` (required): ID of the sound to download
- `quality` (optional): Audio quality ('hq' for high quality or 'lq' for low quality), defaults to 'lq'
- `downloadDir` (optional): Custom download directory, defaults to ~/.freesound-mcp/downloads

Returns:
- `filePath`: Path where the file was downloaded

## Security Considerations

- Keep your `FREESOUND_API_KEY` secret and never expose it in client-side code
- Input parameters are validated to prevent malicious IDs from being passed to the API
- The server follows MCP security best practices for communication

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to [Freesound](https://freesound.org/) for providing the audio resources API
- Built using the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk)