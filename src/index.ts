import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchSounds, downloadSound, downloadOriginalAudio, Sound } from "./tools/freesound.js";

// Create server instance
const server = new McpServer({
    name: "freesound-mcp",
    version: "1.0.0",
});

server.registerTool('freesound_search', {
    title: 'Freesound Search',
    description: 'Search for sounds on Freesound',
    inputSchema: {
        query: z.string().describe("Search keywords"),
        maxDuration: z.number().describe("Maximum duration of sounds in seconds").optional(),
        license: z.string().describe("License of sounds to search for").optional(),
    },
    outputSchema: {
        results: z.array(
            z.object({
                id: z.number().describe("Sound ID"),
                name: z.string().optional().describe("Sound name"),
                duration: z.number().optional().describe("Sound duration in seconds"),
                license: z.string().optional().describe("Sound license"),
                preview: z.string().optional().describe("Sound preview URL"),
            })
        )
    }
}, async (args, extra) => {
    const sounds = await searchSounds(args);
    const structuredContent = {
        results: sounds
    }
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(structuredContent, null, 2)
            }
        ],
        structuredContent
    };
})

server.registerTool('freesound_download', {
    title: 'Freesound Download',
    description: 'Download a sound from Freesound by sound ID',
    inputSchema: {
        soundId: z.number().describe("ID of the sound to download"),
        quality: z.enum(['hq', 'lq']).describe("Audio quality: 'hq' for high quality or 'lq' for low quality").optional().default('lq'),
        downloadDir: z.string().describe("Custom download directory, defaults to ~/.freesound-mcp/downloads").optional(),
    },
    outputSchema: {
        filePath: z.string().describe("Path where the file was downloaded"),
    }
}, async (args, extra) => {
    const { soundId, quality = 'lq', downloadDir } = args;
    const filePath = await downloadSound(soundId, quality, downloadDir);
    return {
        filePath: filePath,
        content: [
            {
                type: "text",
                text: JSON.stringify({ filePath: filePath }, null, 2)
            }
        ],
        structuredContent: { filePath: filePath }
    };
})


async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Freesound MCP Server running on stdio");  // 修正控制台消息
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});