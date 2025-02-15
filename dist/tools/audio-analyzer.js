"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioAnalyzer = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
class AudioAnalyzer {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    async analyzeAudioImplementation() {
        const analysis = {
            bufferManagement: { issues: [], recommendations: [] },
            streamHandling: { issues: [], recommendations: [] },
            playbackIssues: { potentialProblems: [], solutions: [] },
            memoryManagement: { leaks: [], optimizations: [] }
        };
        const files = await this.findAudioRelatedFiles();
        for (const file of files) {
            const content = await fs_1.promises.readFile(file, 'utf-8');
            // Analyze buffer management
            if (this.hasLargeBuffers(content)) {
                analysis.bufferManagement.issues.push(`Large audio buffer detected in ${path.basename(file)}`);
                analysis.bufferManagement.recommendations.push('Consider implementing chunked loading for large audio files');
            }
            // Analyze stream handling
            if (!this.hasProperErrorHandling(content)) {
                analysis.streamHandling.issues.push(`Missing error handling in stream implementation in ${path.basename(file)}`);
                analysis.streamHandling.recommendations.push('Implement comprehensive error handling for audio streams');
            }
            // Check for memory leaks
            if (this.hasPotentialMemoryLeak(content)) {
                analysis.memoryManagement.leaks.push(`Potential memory leak detected in ${path.basename(file)}`);
                analysis.memoryManagement.optimizations.push('Ensure proper cleanup of audio resources in component unmount');
            }
            // Analyze playback implementation
            if (!this.hasPlaybackErrorHandling(content)) {
                analysis.playbackIssues.potentialProblems.push(`Missing playback error handling in ${path.basename(file)}`);
                analysis.playbackIssues.solutions.push('Implement comprehensive playback error handling and recovery');
            }
        }
        return analysis;
    }
    async findAudioRelatedFiles() {
        const audioFiles = [];
        const entries = await fs_1.promises.readdir(this.projectRoot, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(this.projectRoot, entry.name);
            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    const subFiles = await this.findAudioRelatedFiles();
                    audioFiles.push(...subFiles);
                }
            }
            else if (this.isAudioRelatedFile(entry.name)) {
                audioFiles.push(fullPath);
            }
        }
        return audioFiles;
    }
    isAudioRelatedFile(filename) {
        return /\.(tsx?|jsx?)$/.test(filename) && (filename.includes('audio') ||
            filename.includes('player') ||
            filename.includes('stream') ||
            filename.includes('sound'));
    }
    hasLargeBuffers(content) {
        return content.includes('AudioBuffer') ||
            content.includes('createBuffer') ||
            content.includes('WebAudioAPI');
    }
    hasProperErrorHandling(content) {
        return content.includes('try') &&
            content.includes('catch') &&
            content.includes('error');
    }
    hasPotentialMemoryLeak(content) {
        return (content.includes('new Audio') || content.includes('createAudio')) &&
            !content.includes('useEffect') &&
            !content.includes('cleanup');
    }
    hasPlaybackErrorHandling(content) {
        return content.includes('onError') ||
            content.includes('catch') ||
            content.includes('handlePlaybackError');
    }
}
exports.AudioAnalyzer = AudioAnalyzer;
