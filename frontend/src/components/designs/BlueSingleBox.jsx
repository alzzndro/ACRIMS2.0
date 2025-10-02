import '../../assets/css/common/variables.css'

const BlueSingleBox = ({ className }) => {

    return (
        <div className={`relative aspect-square ${className}`}>
            <div className="bg-[var(--blue-logo)] h-full aspect-square absolute"></div>
        </div>
    )
}

export default BlueSingleBox