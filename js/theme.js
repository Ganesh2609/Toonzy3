/**
 * Theme Management System for Toonzy
 * Handles dark/light theme switching with smooth transitions
 */

class ThemeManager {
    constructor() {
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        this.init();
    }

    init() {
        // Theme has already been applied by inline script, just set up toggle
        this.setupToggleButton();
        
        // Listen for system theme changes
        this.setupSystemThemeListener();
    }

    saveTheme(theme) {
        // Save to sessionStorage (memory-based, will reset on new session)
        sessionStorage.setItem('toonzy-theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(theme);
        
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (metaThemeColor) {
            // Set appropriate theme color
            if (theme === 'dark') {
                metaThemeColor.content = '#1f1f1f';
            } else {
                metaThemeColor.content = 'rgb(37, 126, 227)';
            }
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Add a subtle animation effect
        this.addToggleAnimation();
    }

    addToggleAnimation() {
        document.body.style.transition = 'all 0.3s ease';
        
        // Remove transition after animation completes
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    setupToggleButton() {
        const toggleButton = document.getElementById('themeToggle');
        
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleTheme());
            
            // Add keyboard support
            toggleButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleTheme();
                }
            });
            
            // Update button accessibility
            this.updateToggleButtonAria(toggleButton);
        }
    }

    updateToggleButtonAria(button) {
        if (button) {
            const isDark = this.currentTheme === 'dark';
            button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        }
    }

    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            mediaQuery.addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a theme
                if (!sessionStorage.getItem('toonzy-theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // Public methods for external use
    getCurrentTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.applyTheme(theme);
        }
    }

    // Method to reset theme to system preference
    resetToSystem() {
        sessionStorage.removeItem('toonzy-theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.applyTheme(systemTheme);
    }
}

// Initialize theme manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeManager = new ThemeManager();
    });
} else {
    window.themeManager = new ThemeManager();
}

// Listen for theme changes across components
window.addEventListener('themeChanged', (e) => {
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton && window.themeManager) {
        window.themeManager.updateToggleButtonAria(toggleButton);
    }
});

// Export for modules (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
