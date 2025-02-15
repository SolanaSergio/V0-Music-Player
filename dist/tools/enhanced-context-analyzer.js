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
exports.EnhancedContextAnalyzer = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
class EnhancedContextAnalyzer {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.contextCache = new Map();
    }
    async analyzeProjectStructure() {
        const structure = {
            components: [],
            hooks: [],
            utils: []
        };
        // Analyze components
        const componentFiles = await this.findFiles('components');
        for (const file of componentFiles) {
            const context = await this.analyzeFile(file);
            const type = this.determineComponentType(file);
            structure.components.push({
                name: path.basename(file, path.extname(file)),
                type,
                dependencies: context.dependencies,
                patterns: context.patterns
            });
        }
        // Analyze hooks
        const hookFiles = await this.findFiles('hooks');
        for (const file of hookFiles) {
            const context = await this.analyzeFile(file);
            structure.hooks.push({
                name: path.basename(file, path.extname(file)),
                usage: await this.findUsages(file),
                dependencies: context.dependencies
            });
        }
        // Analyze utils
        const utilFiles = await this.findFiles('utils');
        for (const file of utilFiles) {
            const context = await this.analyzeFile(file);
            structure.utils.push({
                name: path.basename(file, path.extname(file)),
                usage: await this.findUsages(file),
                type: this.determineUtilType(file, context)
            });
        }
        return structure;
    }
    async findFiles(directory) {
        const files = [];
        const dirPath = path.join(this.projectRoot, directory);
        try {
            const entries = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    files.push(...await this.findFiles(fullPath));
                }
                else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
                    files.push(fullPath);
                }
            }
        }
        catch (error) {
            console.error(`Error reading directory ${directory}:`, error);
        }
        return files;
    }
    async analyzeFile(filePath) {
        if (this.contextCache.has(filePath)) {
            return this.contextCache.get(filePath);
        }
        const content = await fs_1.promises.readFile(filePath, 'utf-8');
        const context = {
            imports: this.extractImports(content),
            exports: this.extractExports(content),
            dependencies: this.extractDependencies(content),
            patterns: this.identifyPatterns(content),
            relationships: {
                imports: [],
                importedBy: []
            }
        };
        this.contextCache.set(filePath, context);
        return context;
    }
    extractImports(content) {
        const imports = [];
        const importRegex = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        return imports;
    }
    extractExports(content) {
        const exports = [];
        const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        return exports;
    }
    extractDependencies(content) {
        const deps = new Set();
        // Extract npm package dependencies
        const packageRegex = /from\s+['"]([^./][^'"]+)['"]/g;
        let match;
        while ((match = packageRegex.exec(content)) !== null) {
            deps.add(match[1]);
        }
        return Array.from(deps);
    }
    identifyPatterns(content) {
        const patterns = [];
        // Identify React patterns
        if (content.includes('useState'))
            patterns.push('state-management');
        if (content.includes('useEffect'))
            patterns.push('side-effects');
        if (content.includes('useCallback'))
            patterns.push('memoization');
        if (content.includes('useMemo'))
            patterns.push('computation-memoization');
        // Identify audio patterns
        if (content.includes('AudioContext'))
            patterns.push('web-audio-api');
        if (content.includes('createBuffer'))
            patterns.push('audio-buffer');
        if (content.includes('analyser'))
            patterns.push('audio-analysis');
        return patterns;
    }
    determineComponentType(filePath) {
        if (filePath.includes('mobile'))
            return 'mobile';
        if (filePath.includes('shared'))
            return 'shared';
        return 'ui';
    }
    determineUtilType(filePath, context) {
        const fileName = path.basename(filePath);
        const content = context.patterns.join(' ');
        if (fileName.includes('audio') || content.includes('audio'))
            return 'audio';
        if (fileName.includes('ui') || content.includes('component'))
            return 'ui';
        if (fileName.includes('data') || content.includes('fetch'))
            return 'data';
        return 'general';
    }
    async findUsages(filePath) {
        const usages = [];
        const fileName = path.basename(filePath, path.extname(filePath));
        const allFiles = await this.findFiles('');
        for (const file of allFiles) {
            if (file === filePath)
                continue;
            const content = await fs_1.promises.readFile(file, 'utf-8');
            if (content.includes(fileName)) {
                usages.push(file);
            }
        }
        return usages;
    }
}
exports.EnhancedContextAnalyzer = EnhancedContextAnalyzer;
