import { useEffect, useRef } from 'react';
import { FieldErrors } from 'react-hook-form';

/**
 * Hook to automatically scroll to the first form error
 * @param errors - Form errors from react-hook-form
 */
export function useFormErrorScroll(errors: FieldErrors) {
    const errorScrolled = useRef(false);

    useEffect(() => {
        if (Object.keys(errors).length > 0 && !errorScrolled.current) {
            // Find first error field
            const firstErrorKey = Object.keys(errors)[0];
            const errorElement = document.querySelector(
                `[name="${firstErrorKey}"]`,
            ) as HTMLElement;

            if (errorElement) {
                // Scroll to the error field
                errorElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });

                // Focus the field for better UX
                errorElement.focus();

                errorScrolled.current = true;
            }
        } else if (Object.keys(errors).length === 0) {
            // Reset flag when errors are cleared
            errorScrolled.current = false;
        }
    }, [errors]);
}
