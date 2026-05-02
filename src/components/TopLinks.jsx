// components/TopLinks.jsx

import { FaGithub, FaBug, FaCoffee } from 'react-icons/fa';

export default function TopLinks({ bottom }) {
    return (
        <div className={bottom ? 'top-links top-links--bottom' : 'top-links'}>
            <a
                href="https://github.com/philkleer/portuguese-conjugation-react"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
            >
                <FaGithub />
            </a>

            <a
                href="https://github.com/philkleer/portuguese-conjugation-react/issues"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Report a bug"
            >
                <FaBug />
            </a>

            <a
                href="https://buymeacoffee.com/philkleer"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Buy me a coffee"
            >
                <FaCoffee />
            </a>
        </div>
    );
}