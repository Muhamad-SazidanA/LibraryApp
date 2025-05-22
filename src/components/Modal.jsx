import React from "react";
import { Modal as BootstrapModal, Button } from "react-bootstrap";

export default function Modal({ isOpen, onClose, title, children, footer }) {
    return (
        <BootstrapModal show={isOpen} onHide={onClose} centered>
            <BootstrapModal.Header closeButton>
                <BootstrapModal.Title>{title}</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>{children}</BootstrapModal.Body>
            {footer && (
                <BootstrapModal.Footer>
                    {footer}
                    <Button variant="secondary" onClick={onClose}>
                        Close
                    </Button>
                </BootstrapModal.Footer>
            )}
        </BootstrapModal>
    );
}
