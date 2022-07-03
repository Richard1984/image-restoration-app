import styles from './header.module.scss';

interface HeaderProps {

}

const Header = (props: HeaderProps) => {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <h1 className={styles.logo}>Image restoration</h1>
            </div>
            <div className={styles.right}>
            </div>
        </header>
    );
}
    
export default Header;