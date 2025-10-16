import { Link } from 'react-router-dom'
import '../../assets/css/common/variables.css'
import NavBarOne from '../../components/checker/NavBarOne'
import RedBox from '../../components/designs/RedBox'
import { FaDoorClosed } from "react-icons/fa"
import { FaRegSquarePlus } from "react-icons/fa6"
import { FaCalendarAlt } from "react-icons/fa"
import { CiViewList } from "react-icons/ci"
import useGetMe from '../../hooks/useGetMe'
import Loading from '../../components/common/Loading'

const HomePage = () => {
    const { user, error, loading } = useGetMe();

    const profileImageUrl = user?.profile_image_path
        ? `${import.meta.env.VITE_API_URL}${user.profile_image_path}`
        : "/default-avatar.png";

    const toTitleCase = (str) => {
        if (!str) return "";
        return str
            .toLowerCase()
            .split(" ")
            .map(name => name.charAt(0).toUpperCase() + name.slice(1))
            .join(" ");
    }

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <>
            <div className='h-svh relative @container/Home overflow-hidden'>
                {/* Blue Container */}
                <div className="h-52 w-full bg-[var(--blue-logo)] overflow-hidden">
                    <NavBarOne position="end" visibility="hidden" />
                    <div className='w-full h-[calc(12.5rem-3.75rem)] p-2 flex flex-col items-center gap-2'>
                        <img
                            src={profileImageUrl}
                            alt="Profile"
                            className="bg-gray-100 w-20 aspect-square rounded-full object-cover shadow-md shadow-gray-800"
                        />
                        <p className='text-gray-100 font-medium'>{user.first_name !== null ? toTitleCase(user.first_name) : "Edit your name"} {user.last_name !== null ? toTitleCase(user.last_name) : ""}</p>
                    </div>
                </div>
                {/* Body */}
                <div className='p-5 flex flex-wrap gap-5 justify-center @[414px]/Home:gap-10 rounded-2xl bg-white mt-[-1rem]'>
                    <Link to="/rooms" className='w-36 aspect-square bg-[var(--bg-gray)] shadow-lg rounded-2xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <FaDoorClosed size={50} />
                        <p className=''>Rooms</p>
                    </Link>
                    <Link to="/form/new" className='w-36 aspect-square bg-[var(--bg-gray)] shadow-lg rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <FaRegSquarePlus size={50} />
                        <p className=''>Form</p>
                    </Link>
                    <Link to="/schedules" className='w-36 aspect-square bg-[var(--bg-gray)] shadow-lg rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <FaCalendarAlt size={50} />
                        <p className=''>Schedules</p>
                    </Link>
                    <Link to="/mylist" className='w-36 aspect-square bg-[var(--bg-gray)] shadow-lg rounded-3xl flex flex-col justify-center items-center gap-4 focus:bg-blue-300 focus:scale-110'>
                        <CiViewList size={50} />
                        <p className=''>List</p>
                    </Link>

                    {/* Designs */}
                    <div className='absolute rotate-[-45deg] bottom-[-7rem] left-[42%] translate-x-[-50%] z-[-10]'>
                        <RedBox className={'h-40'} />
                    </div>
                </div>
            </div>


        </>
    );
};

export default HomePage;
