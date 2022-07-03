import "./divider.scss";

interface DividerProps {
    text?: string;
}

const Divider = (props: DividerProps) => {
    return (
        <div className="divider">
            <div className="divider__line"></div>
            {props.text && <div className="divider__text">{props.text}</div>}
            <div className="divider__line"></div>
        </div>
    )
}

export default Divider;