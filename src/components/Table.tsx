import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface Artwork {
    id: number;
    title: string;
    artist_display: string;
    place_of_origin: string;
    date_display: string;
    inscriptions: string;
    date_start: number;
    date_end: number;
}

export default function Table() {
    const [artworks, setArtworks] = useState<Artwork[]>([]);
    const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(126079);
    const [rowsPerPage, setRowsPerPage] = useState(12);
    const [totalPages, setTotalPages] = useState(10507);
    const [numRowsToSelect, setNumRowsToSelect] = useState<number>(1);
    const [dropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const fetchData = async (pageNum: number) => {
        try {
            const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNum}`);
            const data = await response.json();
            const artworksData = data.data.map((item: any) => ({
                id: item.id,
                title: item.title,
                artist_display: item.artist_display,
                place_of_origin: item.place_of_origin,
                inscriptions: item.inscriptions,
                date_start: item.date_start,
                date_end: item.date_end,
            }));

            setArtworks(artworksData);
            setTotalRecords(data.pagination.total);
            setTotalPages(data.pagination.total_pages);
            setRowsPerPage(data.pagination.limit);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const onPageChange = (event: any) => {
        setPage(event.page + 1);
    };

    const fetchAdditionalPages = async (startPage: number, numPages: number) => {
        let allArtworks: Artwork[] = [];

        //Logic for selecting pages that are not yet rendered.
        //Ensuring that the API does not get called everytime one by one 
        //and is sequentially fetched so it does not overload the network call


        for (let i = 0; i < numPages; i++) {
            try {
                const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${startPage + i}`);
                const data = await response.json();
                const artworksData = data.data.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    artist_display: item.artist_display,
                    place_of_origin: item.place_of_origin,
                    inscriptions: item.inscriptions,
                    date_start: item.date_start,
                    date_end: item.date_end,
                }));
                allArtworks = [...allArtworks, ...artworksData];
            } catch (error) {
                console.error('Failed to fetch additional pages:', error);
                break;
            }
        }
        return allArtworks;
    };

    const handleRowsToSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNumRowsToSelect(Number(e.target.value));
    };

    const handleSelectRows = async () => {
        const neededRows = numRowsToSelect;
        const currentRows = artworks.length;

        let selected: Artwork[] = [];
        let remainingRows = neededRows - currentRows;

        if (remainingRows > 0) {
            const additionalPages = Math.ceil(remainingRows / rowsPerPage);
            const additionalData = await fetchAdditionalPages(page + 1, additionalPages);
            selected = [...artworks, ...additionalData.slice(0, remainingRows)];
        } else {
            selected = artworks.slice(0, neededRows);
        }

        setSelectedArtworks(selected);
        setDropdownVisible(false);
    };

    return (
        <div className='card'>
            <div className="mb-4 relative">
                <button 
                    onClick={() => setDropdownVisible(!dropdownVisible)} 
                    className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none"
                >
                    {dropdownVisible ? '▲' : '▼'} Select Rows
                </button>
                {dropdownVisible && (
                    <div className="absolute top-full left-0 border border-gray-300 bg-white p-4 shadow-lg z-10">
                        <input
                            type="number"
                            id="numRowsToSelect"
                            value={numRowsToSelect}
                            onChange={handleRowsToSelectChange}
                            min="1"
                            max={rowsPerPage * totalPages}
                            className="border border-gray-300 px-2 py-1 rounded mr-2"
                        />
                        <button 
                            onClick={handleSelectRows} 
                            className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none"
                        >
                            Select
                        </button>
                    </div>
                )}
            </div>
            <DataTable 
                value={artworks} 
                selectionMode="multiple" 
                selection={selectedArtworks}
                onSelectionChange={(e) => setSelectedArtworks(e.value)} 
                dataKey="id" 
                tableStyle={{ minWidth: '100%' }} 
                paginator 
                lazy
                first={(page - 1) * rowsPerPage}  
                rows={rowsPerPage}  
                totalRecords={totalRecords}  
                onPage={onPageChange}  
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="Page {currentPage} of {totalPages}"
                className="table-auto w-full border border-gray-200 mb-30"
                paginatorClassName="paginator-custom" 
            >
                <Column 
                    selectionMode="multiple" 
                    headerStyle={{ width: '3rem' }} 
                    className="bg-gray-100 text-gray-600"
                    bodyStyle={{ padding: '0.5rem', borderBottom: '1px solid #ddd' }} 
                />
                <Column 
                    field="title" 
                    header="Title" 
                    style={{ minWidth: '200px' }} 
                    className="text-center px-4 py-2 border-b border-gray-300"
                />
                <Column 
                    field="place_of_origin" 
                    header="Place of Origin" 
                    style={{ minWidth: '150px' }} 
                    className="text-center px-4 py-2 border-b border-gray-300"
                />
                <Column 
                    field="artist_display" 
                    header="Artist" 
                    style={{ minWidth: '150px' }} 
                    className="text-center px-4 py-2 border-b border-gray-300"
                />
                <Column 
                    field="inscriptions" 
                    header="Inscriptions" 
                    style={{ minWidth: '200px' }} 
                    className="text-center px-4 py-2 border-b border-gray-300"
                />
                <Column 
                    field="date_start" 
                    header="Start Date" 
                    style={{ minWidth: '120px' }} 
                    className="text-center px-4 py-2 border-b border-gray-300"
                />
                <Column 
                    field="date_end" 
                    header="End Date" 
                    style={{ minWidth: '120px' }} 
                    className="text-center px-4 py-2 border-b border-gray-300"
                />
            </DataTable>
        </div>
    );
}
