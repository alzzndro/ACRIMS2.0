import { useEffect, useState } from "react";
import NavBarTwo from "../../components/checker/NavBarTwo";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyListPage = () => {
    const [data, setData] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate('/logout');
            }

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/form/checker`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const result = response?.data ?? [];
            setData(Array.isArray(result) ? result : [result]);
        } catch (error) {
            console.log(error);
            setData([]);
        }
    }

    useEffect(() => {
        fetchData()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // filter data based on search
    const filteredData = data.filter((item) =>
        [item?.room_number ?? "", item?.instructor_name ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const handleRowClick = (id) => {
        navigate(`/form/data/${id}`);
    };

    return (
        <>
            {/* Nav */}
            <div className="fixed w-full bg-white">
                <NavBarTwo message="My List" link="/home" />
            </div>
            <div className="w-full h-15"></div>

            {/* Search */}
            <div className="w-full py-2 px-4 h-14 flex flex-row items-center">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-8 px-3 w-48 bg-gray-200 rounded-2xl outline-none"
                />
            </div>

            {/* Body */}
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead className="bg-blue-900 shadow-xs">
                        <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-white">Room #</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-white">Instructor</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-white">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.reverse().map((item) => (
                            <tr
                                key={item.form_id}
                                className="cursor-pointer bg-gray-100 border-b border-gray-300 shadow-xs h-15 "
                                onClick={() => handleRowClick(item.form_id)}
                            >
                                <td className="px-4 py-2 text-sm text-gray-700">
                                    {item?.room_number || "-"}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">
                                    {item?.instructor_name || "-"}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-700">
                                    {item?.date_monitored ? item.date_monitored.slice(0, 10) : "-"}
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default MyListPage
