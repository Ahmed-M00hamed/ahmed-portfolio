import { useState } from 'react'

/*
  SkillIcon
  ---------
  Shows the real logo of a skill (React, Node.js, Tailwind CSS, ...).

  How the icon is chosen:
  1. If the "icon" field is a URL (https://... or /path.svg)  -> that image is used.
  2. If the "icon" field is an emoji                           -> the emoji is shown.
  3. Otherwise the "icon" field (or the skill NAME when the
     icon field is empty) is converted to a Simple Icons slug
     and loaded from https://cdn.simpleicons.org
  4. If no logo is found -> the first letter of the skill is shown.
*/

const ALIASES = {
    'node.js': 'nodedotjs',
    nodejs: 'nodedotjs',
    node: 'nodedotjs',
    'next.js': 'nextdotjs',
    nextjs: 'nextdotjs',
    'vue.js': 'vuedotjs',
    vue: 'vuedotjs',
    vuejs: 'vuedotjs',
    'nuxt.js': 'nuxt',
    nuxtjs: 'nuxt',
    'express.js': 'express',
    expressjs: 'express',
    'react.js': 'react',
    reactjs: 'react',
    'react native': 'react',
    js: 'javascript',
    ts: 'typescript',
    html: 'html5',
    css: 'css3',
    tailwind: 'tailwindcss',
    'tailwind css': 'tailwindcss',
    'c#': 'csharp',
    'c++': 'cplusplus',
    '.net': 'dotnet',
    mongo: 'mongodb',
    postgres: 'postgresql',
    'framer motion': 'framer',
    'vs code': 'visualstudiocode',
    vscode: 'visualstudiocode',
}

// Logos that are black by default (invisible on a dark background)
const DARK_LOGOS = new Set([
    'github',
    'nextdotjs',
    'express',
    'vercel',
    'flask',
    'notion',
    'shadcnui',
    'radixui',
    'threedotjs',
    'openai',
    'markdown',
])

function toSlug(value) {
    const key = value.trim().toLowerCase()

    if (ALIASES[key]) return ALIASES[key]

    return key
        .replace(/\+/g, 'plus')
        .replace(/\./g, 'dot')
        .replace(/#/g, 'sharp')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]/g, '')
}

function isUrl(value) {
    return (
        /^https?:\/\//i.test(value) ||
        value.startsWith('/') ||
        value.startsWith('data:image')
    )
}

function isEmoji(value) {
    // any non-ASCII character (emoji, symbols)
    return /[^\u0000-\u007f]/.test(value)
}

function SkillIcon({ skill, size = 22, className = '' }) {
    const [failedSrc, setFailedSrc] = useState('')

    const rawIcon = (skill?.icon || '').trim()
    const name = (skill?.name || '').trim()

    // Emoji icon
    if (rawIcon && !isUrl(rawIcon) && isEmoji(rawIcon)) {
        return (
            <span
                className={className}
                style={{ fontSize: size, lineHeight: 1 }}
            >
                {rawIcon}
            </span>
        )
    }

    // Image source (custom URL or Simple Icons CDN)
    let src = ''

    if (rawIcon && isUrl(rawIcon)) {
        src = rawIcon
    } else {
        const slug = toSlug(rawIcon || name)

        if (slug) {
            src = `https://cdn.simpleicons.org/${slug}${
                DARK_LOGOS.has(slug) ? '/white' : ''
            }`
        }
    }

    // Fallback: first letter of the skill name
    if (!src || failedSrc === src) {
        return (
            <span
                className={`font-bold ${className}`}
                style={{ fontSize: size * 0.8, lineHeight: 1 }}
            >
                {name ? name.charAt(0).toUpperCase() : '⚡'}
            </span>
        )
    }

    return (
        <img
            src={src}
            alt={name}
            width={size}
            height={size}
            loading="lazy"
            onError={() => setFailedSrc(src)}
            className={`object-contain ${className}`}
            style={{ width: size, height: size }}
        />
    )
}

export default SkillIcon
