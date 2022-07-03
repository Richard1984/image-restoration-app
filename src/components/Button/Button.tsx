
import { HTMLProps } from 'react';
import './button.scss';

export interface ButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    componentProps?: HTMLProps<HTMLButtonElement>;
    leftIcon?: React.ReactNode;
    text?: string;
    type?: "reset" | "submit" | "button";
}

const Button = (props: ButtonProps) => {

    const { children, onClick, className, componentProps, leftIcon, text, type } = props;
    
    return (
        <button className={`button ${className}`} {...componentProps} type={type} {...(type === "button" || type === undefined ? { onClick } : {})}>
            {leftIcon && <div className="button__icon">{props.leftIcon}</div>}
            {text && <div className="button__text">{props.text}</div>}
            {children}
        </button>
    );
}

export default Button