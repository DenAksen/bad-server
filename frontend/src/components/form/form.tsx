import clsx from 'clsx'
import {
    DetailedHTMLProps,
    FormHTMLAttributes,
    ReactNode,
    SyntheticEvent,
    useEffect,
    useState,
} from 'react'
import styles from './form.module.scss'

interface FormProps
    extends DetailedHTMLProps<
        FormHTMLAttributes<HTMLFormElement>,
        HTMLFormElement
    > {
    handleFormSubmit?: (e: SyntheticEvent<HTMLFormElement>) => void
    children: ReactNode
    extraClass?: string
    formRef?: React.RefObject<HTMLFormElement>
}

export default function Form({
    handleFormSubmit,
    children,
    extraClass,
    formRef,
    ...props
}: FormProps) {
    const [csrfToken, setCsrfToken] = useState('');

    useEffect(() => {
        fetch('/api/csrf-token', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setCsrfToken(data.csrfToken))
            .catch(err => console.error('CSRF error:', err));
            console.log(csrfToken)
    }, []);
    return (
        <form
            ref={formRef}
            className={clsx(styles.form, {
                [extraClass as string]: !!extraClass,
            })}
            onSubmit={handleFormSubmit}
            {...props}
        >
            <input type="hidden" name="csrfToken" value={csrfToken} />
            {children}
        </form>
    )
}
