import { useEffect, useRef, type ReactNode } from "react";
import "./modal-window.css";

interface ModalWindowProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    className?: string;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
}

export default function ModalWindow({
    isOpen,
    onClose,
    children,
    className = "",
    closeOnOutsideClick = true,
    closeOnEscape = true,
}: ModalWindowProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (closeOnEscape && e.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose, closeOnEscape]);

    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnOutsideClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleOutsideClick}>
            <div className={`modal-content ${className}`} ref={modalRef}>
                <button
                    className="modal-close-btn"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    ×
                </button>
                {children}
            </div>
        </div>
    );
}
