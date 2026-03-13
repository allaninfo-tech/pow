'use client';

import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
};

export const triggerLeagueUpConfetti = () => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    
    // Golden confetti for league up
    const defaults = { startVelocity: 45, spread: 100, ticks: 100, zIndex: 100, colors: ['#f59e0b', '#fbbf24', '#ffffff'] };

    const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 100 * (timeLeft / duration);
        confetti({
            ...defaults,
            particleCount,
            origin: { x: 0.5, y: 0.8 }, // Shoot up from center bottom
            angle: 90
        });
    }, 250);
};
