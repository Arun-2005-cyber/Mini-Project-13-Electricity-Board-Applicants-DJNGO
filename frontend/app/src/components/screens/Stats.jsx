import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import API_URL from "../../config";
import Loader from "../Loader";
import Message from "../Message";

function Stats() {
  const [selectedStatus, setSelectedStatus] = useState(''); // '' = All
  const [chartData, setChartData] = useState({ labels: [], total_requests: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const canvasRefBar = useRef(null);
  const canvasRefPie = useRef(null);
  const chartBarRef = useRef(null);
  const chartPieRef = useRef(null);

  // Fetch data on status change
  useEffect(() => {
    fetchData(selectedStatus);
    return () => destroyCharts(); // cleanup
  }, [selectedStatus]);

  const destroyCharts = () => {
    if (chartBarRef.current) {
      chartBarRef.current.destroy();
      chartBarRef.current = null;
    }
    if (chartPieRef.current) {
      chartPieRef.current.destroy();
      chartPieRef.current = null;
    }
  };

  const fetchData = async (status) => {
    setLoading(true);
    setError('');
    setMessage('');
    destroyCharts();

    try {
      const encodedStatus = encodeURIComponent(status || '');
      const url = `${API_URL}/api/connectionrequestdata/?status=${encodedStatus}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      const labels = Array.isArray(data.labels) ? data.labels : [];
      const total_requests = Array.isArray(data.total_requests) ? data.total_requests : [];

      setChartData({ labels, total_requests });

      if (labels.length === 0) {
        setMessage("ℹ️ No data available for the selected filter.");
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      createCharts(labels, total_requests);
      setMessage("✅ Data loaded successfully!");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("⚠️ Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
    }
  };

  const createCharts = (labels, total_requests) => {
    const ctxBar = canvasRefBar.current?.getContext('2d');
    const ctxPie = canvasRefPie.current?.getContext('2d');
    if (!ctxBar || !ctxPie) return;

    chartBarRef.current = new Chart(ctxBar, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: "Connection Requests per Month",
            data: total_requests,
            backgroundColor: 'rgba(54,162,235,0.6)',
            borderColor: 'rgba(54,162,235,1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } },
        plugins: {
          legend: { labels: { color: '#fff' } },
          title: { display: false },
        },
      },
    });

    chartPieRef.current = new Chart(ctxPie, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: total_requests,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
              '#9966FF', '#FF9F40', '#66FF66', '#C9CBCF'
            ],
            borderColor: 'white',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#fff' } } },
      },
    });
  };

  return (
    <div className="container m-5 p-5 card chart" style={{ background: "#1f1f1f", color: "#fff" }}>
      <div className="row">
        <div className="col-md-3">
          <Link to="/" className="btn btn-primary my-1">Go Back</Link>
        </div>

        <div className="col-md-12">
          <h5 className="mt-2">Number of connection requests in every month visualization</h5>
        </div>

        <div className="col-md-4 mt-3">
          <label htmlFor="status" className="form-label text-light">
            Filter by Connection status
          </label>
          <select
            className="form-select"
            id="status"
            onChange={(e) => setSelectedStatus(e.target.value || '')}
            value={selectedStatus}
          >
            <option value="">All</option>
            <option value="Connection Released">Connection Released</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="col-md-12 mt-3">
          {loading && <Loader />}
          {error && <Message variant="danger">{error}</Message>}
          {message && !error && <Message variant="info">{message}</Message>}
        </div>

        {!loading && !error && chartData.labels.length > 0 && (
          <>
            <div className="col-md-6 mt-4" style={{ height: 320 }}>
              <canvas ref={canvasRefBar} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="col-md-6 mt-4" style={{ height: 320 }}>
              <canvas ref={canvasRefPie} style={{ width: '100%', height: '100%' }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Stats;
