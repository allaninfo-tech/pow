'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTerminalProps {
    className?: string;
}

const codeSnippet = `import { useAuth, Validation } from '@proofstack/core';

export async function loginUser(req: Request) {
  const { email, password } = await req.json();
  
  // Verify credentials against AI matrix
  const session = await useAuth.authenticate({
    email,
    password,
    validationLevel: Validation.STRICT,
  });

  if (!session.isValid) {
    throw new Error('Authentication failed');
  }

  // Initialize secure environment
  await session.initWorkspace();
  
  return {
    status: 'success',
    token: session.token,
    user: session.profile
  };
}`;

export default function TypewriterTerminal({ className }: TypewriterTerminalProps) {
    const [text, setText] = useState('');
    const [cursorVisible, setCursorVisible] = useState(true);

    useEffect(() => {
        let currentIndex = 0;
        const typingInterval = setInterval(() => {
            if (currentIndex <= codeSnippet.length) {
                setText(codeSnippet.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
            }
        }, 30); // Speed of typing

        return () => clearInterval(typingInterval);
    }, []);

    useEffect(() => {
        const cursorInterval = setInterval(() => {
            setCursorVisible(v => !v);
        }, 500);
        return () => clearInterval(cursorInterval);
    }, []);

    // Monokai syntax highlighting
    const highlightCode = (codeText: string) => {
        return codeText.split('\n').map((line, lineIndex) => {
            let highlightedHtml = line
                .replace(/import|export|from|async|await|return|if|throw|new/g, '<span class="text-[#f92672]">$&</span>') // Pink/Magenta
                .replace(/function|const|let/g, '<span class="text-[#66d9ef]">$&</span>') // Light Blue
                .replace(/['"].*?['"]/g, '<span class="text-[#e6db74]">$&</span>') // Yellow strings
                .replace(/\/\/.*$/g, '<span class="text-[#75715e]">$&</span>') // Grey comments
                .replace(/([a-zA-Z_]\w*)(?=\()/g, '<span class="text-[#a6e22e]">$&</span>') // Green functions
                .replace(/\{|\}|\(|\)/g, '<span class="text-[#f8f8f2]">$&</span>'); // Off-white brackets

            // Wrap the rest of the text in the default Monokai off-white
            return (
                <div key={lineIndex} className="leading-relaxed min-h-[1.5rem] text-[#f8f8f2]" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
            );
        });
    };

    return (
        <div className={cn("absolute inset-0 overflow-hidden font-mono text-xs sm:text-sm p-8 opacity-20 pointer-events-none select-none", className)}>
            <div className="relative w-full h-full">
                {highlightCode(text)}
                {/* Simulated cursor that follows the text */}
                <span
                    className={cn(
                        "inline-block w-2 sm:w-2.5 h-4 sm:h-5 bg-[#f8f8f2] translate-y-1 ml-0.5",
                        cursorVisible ? 'opacity-100' : 'opacity-0'
                    )}
                />
            </div>
        </div>
    );
}
