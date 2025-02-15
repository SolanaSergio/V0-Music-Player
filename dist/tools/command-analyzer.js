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
exports.CommandAnalyzer = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
class CommandAnalyzer {
    constructor() {
        this.POWERSHELL_PATTERNS = {
            separators: [';', '|', '&&'],
            commonCommands: {
                'npm run': 'npm.cmd run',
                'npm install': 'npm.cmd install',
                'npm uninstall': 'npm.cmd uninstall',
                'npx': 'npx.cmd',
                'ts-node': 'ts-node.cmd'
            },
            directoryCommands: {
                'rm -rf': 'Remove-Item -Recurse -Force',
                'mkdir': 'New-Item -ItemType Directory -Path',
                'touch': 'New-Item -ItemType File -Path'
            }
        };
    }
    async analyzeCommand(command) {
        const analysis = {
            suggestedCommand: '',
            explanation: '',
            alternatives: [],
            powershellSpecific: false
        };
        // Handle ts-node specific cases
        if (command.includes('ts-node')) {
            analysis.powershellSpecific = true;
            const converted = this.handleTsNodeCommand(command);
            analysis.suggestedCommand = converted.command;
            analysis.explanation = converted.explanation;
            analysis.alternatives = converted.alternatives;
            return analysis;
        }
        // Check for Unix-style commands and convert to PowerShell
        if (this.isUnixStyleCommand(command)) {
            analysis.powershellSpecific = true;
            const converted = this.convertToPoweShell(command);
            analysis.suggestedCommand = converted.command;
            analysis.explanation = converted.explanation;
        }
        else {
            // Handle npm/npx commands
            if (command.startsWith('npm ') || command.startsWith('npx ')) {
                analysis.suggestedCommand = this.convertNpmCommand(command);
                analysis.explanation = 'PowerShell requires .cmd suffix for npm/npx commands';
            }
        }
        // Generate alternatives
        analysis.alternatives = this.generateAlternatives(command);
        return analysis;
    }
    handleTsNodeCommand(command) {
        if (command.includes('ts-node src/')) {
            return {
                command: 'npx.cmd ts-node.cmd --project tsconfig.json src/index.ts',
                explanation: 'Using explicit project file and proper PowerShell command format',
                alternatives: [
                    'npx.cmd ts-node-dev.cmd --respawn src/index.ts',
                    'npm.cmd run dev'
                ]
            };
        }
        return {
            command: command.replace('ts-node', 'ts-node.cmd'),
            explanation: 'Adding .cmd suffix for PowerShell compatibility',
            alternatives: []
        };
    }
    isUnixStyleCommand(command) {
        const unixCommands = ['rm', 'mkdir', 'touch', 'ls', 'cp', 'mv'];
        return unixCommands.some(cmd => command.startsWith(cmd));
    }
    convertToPoweShell(command) {
        const parts = command.split(' ');
        const baseCommand = parts[0];
        switch (baseCommand) {
            case 'rm':
                return {
                    command: `Remove-Item ${parts.includes('-rf') ? '-Recurse -Force' : ''} ${parts.slice(-1)}`,
                    explanation: 'Converting Unix rm command to PowerShell Remove-Item'
                };
            case 'mkdir':
                return {
                    command: `New-Item -ItemType Directory -Path "${parts[1]}"`,
                    explanation: 'Converting Unix mkdir command to PowerShell New-Item'
                };
            case 'ls':
                return {
                    command: 'Get-ChildItem',
                    explanation: 'Converting Unix ls command to PowerShell Get-ChildItem'
                };
            default:
                return {
                    command: command,
                    explanation: 'No conversion needed'
                };
        }
    }
    convertNpmCommand(command) {
        return command
            .replace('npm ', 'npm.cmd ')
            .replace('npx ', 'npx.cmd ');
    }
    generateAlternatives(command) {
        const alternatives = [];
        // Add PowerShell native alternatives
        if (command.includes('&&')) {
            alternatives.push(command.replace('&&', ';'));
        }
        // Add command variations
        if (command.startsWith('npm run')) {
            alternatives.push(command.replace('npm run', 'npm.cmd run'), command.replace('npm run', 'npx.cmd'));
        }
        // Add ts-node alternatives
        if (command.includes('ts-node')) {
            alternatives.push('npx.cmd ts-node.cmd --project tsconfig.json src/index.ts', 'npx.cmd ts-node-dev.cmd --respawn src/index.ts');
        }
        return alternatives;
    }
    async saveCommandHistory(command, success) {
        const historyPath = path.join(process.cwd(), 'command-history.json');
        let history;
        try {
            const existingHistory = await fs_1.promises.readFile(historyPath, 'utf-8');
            history = JSON.parse(existingHistory);
        }
        catch {
            history = {
                successful: [],
                failed: [],
                patterns: {
                    common: [],
                    errors: []
                }
            };
        }
        if (success) {
            history.successful.push(command);
        }
        else {
            history.failed.push(command);
        }
        // Update patterns
        this.updatePatterns(history, command, success);
        await fs_1.promises.writeFile(historyPath, JSON.stringify(history, null, 2));
    }
    updatePatterns(history, command, success) {
        const pattern = this.extractCommandPattern(command);
        if (success) {
            if (!history.patterns.common.includes(pattern)) {
                history.patterns.common.push(pattern);
            }
        }
        else {
            if (!history.patterns.errors.includes(pattern)) {
                history.patterns.errors.push(pattern);
            }
        }
    }
    extractCommandPattern(command) {
        // Extract the base command pattern (e.g., "npm run" from "npm run dev")
        const parts = command.split(' ');
        if (parts.length >= 2) {
            return `${parts[0]} ${parts[1]}`;
        }
        return parts[0];
    }
}
exports.CommandAnalyzer = CommandAnalyzer;
