import '../../assets/css/common/variables.css'

const BlueBox = ({ className }) => {

    return (
        <div className={`relative aspect-square ${className}`}>
            <div className="bg-[var(--blue-logo)] opacity-50 h-full aspect-square absolute  top-10 left-10"></div>
            <div className="bg-[var(--blue-logo)] opacity-75 h-full aspect-square absolute left-5 top-5"></div>
            <div className="bg-[var(--blue-logo)] h-full aspect-square absolute"></div>
        </div>
    )
}

export default BlueBox