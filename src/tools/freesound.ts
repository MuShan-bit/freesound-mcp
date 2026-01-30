import fs from "fs"
import os from "os";
import path from "path";

const API_KEY = process.env.FREESOUND_API_KEY;
const BASE_URL = "https://freesound.org/apiv2";

export interface Sound {
    id: number;
    name: string;
    duration: number;
    license: string;
    preview: string;
}

export interface SearchData {
    results: SearchDataItem[];
}

export interface SearchDataItem {
    id: number;
    name: string;
    duration: number;
    license: string;
    previews: {
        "preview-hq-mp3": string;
        "preview-lq-mp3": string;
    };
}

/**
 * fetch
 * @param url url
 * @returns result
 */
async function apiFetch(url: string) {
    const res = await fetch(url, {
        headers: {
            "Authorization": `Token ${API_KEY}`
        }
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Freesound API error: ${res.status} - ${errorText}`);
    }

    return res.json();
}

/**
 * searchSounds
 * @param query query
 * @param maxDuration maxDuration
 * @param license license
 * @returns result
 */
export async function searchSounds({ query, maxDuration, license }: { query: string, maxDuration?: number, license?: string }): Promise<Sound[]> {
    let url = `${BASE_URL}/search/text/?query=${encodeURIComponent(query)}&fields=id,name,duration,previews,license`;

    if (maxDuration) {
        url += `&filter=duration:[0+TO+${maxDuration}]`;
    }
    if (license) {
        url += `&filter=license:${license}`;
    }

    const data: SearchData = await apiFetch(url);

    return data.results.map(item => ({
        id: item.id,
        name: item.name,
        duration: item.duration,
        license: item.license,
        preview: item.previews["preview-hq-mp3"]
    }));
}

/**
 * downloadSound
 * @param soundId soundId
 * @param quality audio quality ('hq' for high quality or 'lq' for low quality)
 * @param downloadDir custom download directory
 * @returns result
 */ 
export async function downloadSound(soundId: number, quality: 'hq' | 'lq' = 'lq', downloadDir?: string) {
    const sound = await apiFetch(`${BASE_URL}/sounds/${soundId}/`);

    // Determine which preview URL to use based on quality
    let previewUrl: string;
    if (quality === 'hq') {
        previewUrl = sound.previews?.["preview-hq-mp3"] || sound.previews?.["preview-lq-mp3"];
    } else {
        previewUrl = sound.previews?.["preview-lq-mp3"] || sound.previews?.["preview-hq-mp3"];
    }

    if (!previewUrl) {
        throw new Error('No preview available for this sound');
    }

    const res = await fetch(previewUrl);

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Download failed: ${res.status} - ${errorText}`);
    }

    // Use provided directory or default to ~/.freesound-mcp/downloads
    const dir = downloadDir || path.join(os.homedir(), '.freesound-mcp', 'downloads');
    
    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${soundId}_preview_${quality}.mp3`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filePath, new Uint8Array(buffer));

    return filePath;
}

// New function to download original audio (requires OAuth2)
export async function downloadOriginalAudio(soundId: number, accessToken: string, downloadDir?: string) {
    const sound = await apiFetch(`${BASE_URL}/sounds/${soundId}/`);

    const downloadUrl = sound.download;

    const res = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Download failed: ${res.status} - ${errorText}`);
    }

    // Use provided directory or default to ~/.freesound-mcp/downloads
    const dir = downloadDir || path.join(os.homedir(), '.freesound-mcp', 'downloads');
    
    // Ensure directory exists
    fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${soundId}.${sound.type || 'wav'}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(filePath, new Uint8Array(buffer));

    return filePath;
}

