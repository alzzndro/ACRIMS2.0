
import '../../assets/css/common/variables.css';
import { IoArrowBack } from 'react-icons/io5';
import { IoNotificationsOutline } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import useGetMe from '../../hooks/useGetMe';
import Loading from '../common/Loading';

const NavBarTwo = (props) => {
    const { user, error, loading } = useGetMe();

    const navigate = useNavigate()
    const handleBackArrow = () => {
        navigate(-1);
    }

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="w-full h-15 p-2 flex flex-row justify-between border-b-2 border-gray-300">
            <button onClick={handleBackArrow} className='h-full w-12 flex justify-center items-center rounded-4xl focus:bg-gray-200 focus:text-red-500'><IoArrowBack size={30} /></button>
            <h1 className='h-full flex items-center text-2xl font-medium'>{props.message}</h1>
            <div className='flex flex-row gap-2 h-full'>
                <button className='h-full w-12 flex justify-center items-center rounded-4xl focus:bg-gray-200 focus:text-red-500'><IoNotificationsOutline size={30} /></button>

                <img
                    src={
                        user.profile_image_path
                            ? `${import.meta.env.VITE_API_URL}${user.profile_image_path}`
                            : "/default-avatar.png"
                    }
                    alt="profile image"
                    className='bg-gray-100 w-10 aspect-square rounded-full'
                />
            </div>
        </div>
    )
}

export default NavBarTwo