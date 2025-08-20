import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

function Stats() {

    const [selectedStatus, setselectedStatus] = useState('');
    const [chartData, setChartData] = useState({ labels: [], total_requests: [] });
    const canvasRef = useRef(null);
    const chartRef = useRef(null);
    const canvasRef2 = useRef(null);
    const chartRef2 = useRef(null);

    useEffect(() => {
        fetchData(selectedStatus);
    }, [selectedStatus])

    const fetchData = async (status) => {
        try {
            const url = `http://127.0.0.1:8000/api/connectionrequestdata?status=${status}`;
            const response = await fetch(url);
            const data = await response.json();
            setChartData(data);
            updateChart(data);
        }
        catch (error) {
            console.log("Error fetching data", error)
        }
    }


    const createChart = (data) => {
        const ctx = canvasRef.current.getContext('2d');
        const ctx2 = canvasRef2.current.getContext('2d');
console.log("CTX:", ctx);
console.log("CTX2:", ctx2);
        
        chartRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: "Number of connection request by month",
                    data: data.total_requests,
                    backgroundColor: 'rgba(54,162,235,0.6)',
                    borderColor: 'rgba(54,162,235,1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        chartRef2.current = new Chart(ctx2, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    label: "Number of connection request by month",
                    data: data.total_requests,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                        '#FF9F40', '#66FF66'
                    ],
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });


    }


   const updateChart = (data) => {
    if (chartRef.current) {
        chartRef.current.data.labels = data.labels;
        chartRef.current.data.datasets[0].data = data.total_requests;
        chartRef.current.update();
        chartRef2.current.data.labels = data.labels;
        chartRef2.current.data.datasets[0].data = data.total_requests;
        chartRef2.current.update();
    } else {
        // Delay createChart slightly to ensure canvas is rendered
        setTimeout(() => createChart(data), 1);
    }
};

   const handleStatusChange = (event) => {
        setselectedStatus(event.target.value);
    }

    return (
        <div className="container m-5 p-5 card chart">
    <div className="row">
        <div className="col-md-3">
            <Link to='/' className='btn btn-primary my-1'> Go Back</Link>
        </div>
        <div className="col-md-12">
            <h5>Number of connection requests in every month visualization</h5>
        </div>

        <div className="col-md-4">
            <br />
            <label htmlFor="status" className='form-label'>Filter by Connection status</label>
            <select className='form-select' id="status" onChange={handleStatusChange} value={selectedStatus}>
                <option value="">All</option>
                <option value="Connection Released">Connection Released</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Rejected">Rejected</option>
            </select>
        </div>

        <div className="col-md-6 mt-4">
    <canvas ref={canvasRef} width="100" height="50"></canvas>
</div>
<div className="col-md-6 mt-4">
    <canvas ref={canvasRef2} width="100" height="50"></canvas>
</div>

    </div>
</div>

    )
}

export default Stats