"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const context_analyzer_1 = require("./tools/context-analyzer");
const audio_analyzer_1 = require("./tools/audio-analyzer");
const command_analyzer_1 = require("./tools/command-analyzer");
const enhanced_context_analyzer_1 = require("./tools/enhanced-context-analyzer");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Initialize tools
const contextAnalyzer = new context_analyzer_1.ContextAnalyzer(process.cwd());
const audioAnalyzer = new audio_analyzer_1.AudioAnalyzer(process.cwd());
const commandAnalyzer = new command_analyzer_1.CommandAnalyzer();
const enhancedContextAnalyzer = new enhanced_context_analyzer_1.EnhancedContextAnalyzer(process.cwd());
// Define MCP tools
const tools = [
    {
        name: 'analyzeContext',
        description: 'Analyzes the project context including files, dependencies, and patterns',
        parameters: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Path to analyze (relative to project root)'
                }
            },
            required: ['path']
        }
    },
    {
        name: 'analyzeAudio',
        description: 'Analyzes audio implementation for potential issues and optimizations',
        parameters: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Path to analyze (relative to project root)'
                }
            },
            required: ['path']
        }
    },
    {
        name: 'analyzeCommand',
        description: 'Analyzes and suggests proper PowerShell commands',
        parameters: {
            type: 'object',
            properties: {
                command: {
                    type: 'string',
                    description: 'The command to analyze'
                }
            },
            required: ['command']
        }
    },
    {
        name: 'analyzeProjectStructure',
        description: 'Provides detailed analysis of project structure and relationships',
        parameters: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Path to analyze (relative to project root)'
                }
            },
            required: ['path']
        }
    }
];
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'MCP Server is running', tools: tools.map(t => t.name) });
});
// SSE endpoint for Cursor
app.get('/sse', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Send tools list
    res.write(`data: ${JSON.stringify({ type: 'tools', tools })}\n\n`);
    // Keep connection alive
    const keepAlive = setInterval(() => {
        res.write(': keepalive\n\n');
    }, 30000);
    req.on('close', () => {
        clearInterval(keepAlive);
    });
});
// Tool execution endpoint
app.post('/execute/:tool', async (req, res, next) => {
    const { tool } = req.params;
    const { path: targetPath, command } = req.body;
    try {
        switch (tool) {
            case 'analyzeContext': {
                const analysis = await contextAnalyzer.analyzeProject();
                res.json(analysis);
                break;
            }
            case 'analyzeAudio': {
                const analysis = await audioAnalyzer.analyzeAudioImplementation();
                res.json(analysis);
                break;
            }
            case 'analyzeCommand': {
                if (!command) {
                    const error = new Error('Command parameter is required');
                    error.status = 400;
                    throw error;
                }
                const analysis = await commandAnalyzer.analyzeCommand(command);
                res.json(analysis);
                break;
            }
            case 'analyzeProjectStructure': {
                const analysis = await enhancedContextAnalyzer.analyzeProjectStructure();
                res.json(analysis);
                break;
            }
            default: {
                const error = new Error('Tool not found');
                error.status = 404;
                throw error;
            }
        }
    }
    catch (error) {
        next(error);
    }
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        status: err.status || 500
    });
});
// Start server
app.listen(port, () => {
    console.log(`MCP Server is running on http://localhost:${port}`);
    console.log('Available tools:', tools.map(t => t.name).join(', '));
});
