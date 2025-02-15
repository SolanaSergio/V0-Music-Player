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
exports.ContextAnalyzer = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
class ContextAnalyzer {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
    }
    async analyzeProject() {
        const files = await this.getAllFiles(this.projectRoot);
        const dependencies = await this.analyzeDependencies();
        const patterns = await this.analyzePatterns(files);
        return {
            files,
            dependencies,
            patterns
        };
    }
    async getAllFiles(dir) {
        const files = [];
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    files.push(...await this.getAllFiles(fullPath));
                }
            }
            else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
                files.push(fullPath);
            }
        }
        return files;
    }
    async analyzeDependencies() {
        try {
            const packageJson = await fs.readFile(path.join(this.projectRoot, 'package.json'), 'utf-8');
            const { dependencies = {}, devDependencies = {} } = JSON.parse(packageJson);
            return { ...dependencies, ...devDependencies };
        }
        catch (error) {
            console.error('Error analyzing dependencies:', error);
            return {};
        }
    }
    async analyzePatterns(files) {
        const patterns = {
            components: [],
            hooks: [],
            utils: []
        };
        for (const file of files) {
            const content = await fs.readFile(file, 'utf-8');
            // Analyze components
            if (/components\/.*\.(tsx|jsx)$/.test(file)) {
                const componentName = path.basename(file, path.extname(file));
                patterns.components.push(componentName);
            }
            // Analyze hooks
            if (/hooks\/.*\.(ts|tsx)$/.test(file)) {
                const hookName = path.basename(file, path.extname(file));
                patterns.hooks.push(hookName);
            }
            // Analyze utils
            if (/utils\/.*\.(ts|js)$/.test(file)) {
                const utilName = path.basename(file, path.extname(file));
                patterns.utils.push(utilName);
            }
        }
        return patterns;
    }
}
exports.ContextAnalyzer = ContextAnalyzer;
