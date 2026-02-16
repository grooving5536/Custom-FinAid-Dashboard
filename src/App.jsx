import React, { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import './App.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function App() {
  const [totalStudents, setTotalStudents] = useState(500)
  const [afatPercentage, setAfatPercentage] = useState(25)
  const [fwsPercentage, setFwsPercentage] = useState(20)
  const avgAfatAmount = 3000 // Fixed value
  const [avgFwsAmount, setAvgFwsAmount] = useState(3000)
  const [totalYears, setTotalYears] = useState(10)
  const [loanInterestRate, setLoanInterestRate] = useState(8.94) // Percentage value

  // Calculate aggregate dollar amounts for each year
  const chartData = useMemo(() => {
    if (totalYears === 0) {
      return {
        labels: [],
        values: []
      }
    }
    const years = Array.from({ length: totalYears }, (_, i) => i + 1)
    const afatStudents = Math.floor((totalStudents * afatPercentage) / 100)
    const fwsStudents = Math.floor((totalStudents * fwsPercentage) / 100)
    
    // Calculate cumulative totals over time
    let cumulativeTotal = 0
    const data = years.map((year) => {
      const yearAfatTotal = afatStudents * avgAfatAmount
      const yearFwsTotal = fwsStudents * avgFwsAmount
      const yearTotal = yearAfatTotal + yearFwsTotal
      cumulativeTotal += yearTotal
      return cumulativeTotal
    })

    return {
      labels: years.map(y => `Year ${y}`),
      values: data
    }
  }, [totalStudents, afatPercentage, fwsPercentage, avgAfatAmount, avgFwsAmount, totalYears])

  const chartConfig = {
    labels: chartData.labels || [],
    datasets: [
      {
        label: 'Cumulative Aggregate Dollar Amount',
        data: chartData.values || [],
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#333'
        }
      },
      title: {
        display: true,
        text: 'Aggregate Dollar Amount Over Time',
        font: {
          size: 20,
          weight: 'bold'
        },
        color: '#333',
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `$${context.parsed.y.toLocaleString('en-US', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            })}`
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString('en-US', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            })
          },
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          font: {
            size: 12
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  }

  // Loan constants
  const LOAN_ORIGINATION_FEE_RATE = 0.04228 // 4.228%
  const LOAN_INTEREST_RATE = loanInterestRate / 100 // Convert percentage to decimal

  const currentYearTotal = chartData.values && chartData.values.length > 0 ? chartData.values[chartData.values.length - 1] : 0
  const afatStudents = Math.floor((totalStudents * afatPercentage) / 100)
  const fwsStudents = Math.floor((totalStudents * fwsPercentage) / 100)
  const yearAfatTotal = afatStudents * avgAfatAmount
  const yearFwsTotal = fwsStudents * avgFwsAmount
  const annualTotal = yearAfatTotal + yearFwsTotal

  // Calculate loan costs
  // If grants total $X, to receive $X as a loan, student needs to borrow $X / (1 - origination_fee)
  // Origination fee cost = borrowed amount * origination_fee_rate
  // Interest accrues on the borrowed amount each year
  const calculateLoanCosts = useMemo(() => {
    if (totalYears === 0) {
      return {
        annualLoanCost: 0,
        cumulativeLoanCost: 0
      }
    }

    // Annual loan cost: origination fee + interest for one year (with daily compounding)
    // To receive annualTotal, need to borrow: annualTotal / (1 - LOAN_ORIGINATION_FEE_RATE)
    const annualBorrowedAmount = annualTotal / (1 - LOAN_ORIGINATION_FEE_RATE)
    const annualOriginationFee = annualBorrowedAmount * LOAN_ORIGINATION_FEE_RATE
    
    // Daily compounding: interest = Principal * ((1 + rate/365)^365 - 1)
    const dailyRate = LOAN_INTEREST_RATE / 365
    const annualInterest = annualBorrowedAmount * (Math.pow(1 + dailyRate, 365) - 1)
    const annualLoanCost = annualOriginationFee + annualInterest

    // Cumulative loan cost: sum of origination fees + accumulated interest over all years
    // Each year, student borrows the same amount to receive annualTotal
    // Total origination fees over all years
    const totalOriginationFees = annualOriginationFee * totalYears
    
    // Cumulative interest with daily compounding:
    // Each year's loan compounds daily for the remaining years
    // Year 1 loan compounds for totalYears years
    // Year 2 loan compounds for (totalYears - 1) years, etc.
    let cumulativeInterest = 0
    for (let year = 1; year <= totalYears; year++) {
      const yearsRemaining = totalYears - year + 1
      const daysRemaining = yearsRemaining * 365
      // Interest = Principal * ((1 + daily_rate)^days - 1)
      const yearInterest = annualBorrowedAmount * (Math.pow(1 + dailyRate, daysRemaining) - 1)
      cumulativeInterest += yearInterest
    }
    
    const cumulativeLoanCost = totalOriginationFees + cumulativeInterest

    return {
      annualLoanCost,
      cumulativeLoanCost
    }
  }, [annualTotal, totalYears, loanInterestRate])

  const annualSavings = annualTotal - calculateLoanCosts.annualLoanCost
  const cumulativeSavings = currentYearTotal - calculateLoanCosts.cumulativeLoanCost

  return (
    <div className="app">
      <div className="header">
        <img src="/logo-left.png" alt="Scholarships & Financial Aid" className="header-logo header-logo-left" />
        <div className="header-text">
          <h1>{"Abhijay's Custom Financial Aid Projector"}</h1>
          <p>Interactive tool for projecting aggregate Federal Work Study (FWS) and Arizona Financial Aid Trust (AFAT) awards over time for M.D. students at the University of Arizona College of Medicine-Tucson</p>
        </div>
        <img src="/logo-right.png" alt="College of Medicine Tucson - Financial Aid" className="header-logo header-logo-right" />
      </div>
      
      <div className="main-container">
        <div className="chart-container">
          <div className="chart-wrapper">
            {chartData.labels.length > 0 ? (
              <Line data={chartConfig} options={options} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                Set years projected to see chart
              </div>
            )}
          </div>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Annual Total</h3>
              <p className="amount">${annualTotal.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}</p>
            </div>
            <div className="summary-card">
              <h3>Cumulative Total ({totalYears} {totalYears === 1 ? 'year' : 'years'})</h3>
              <p className="amount">${currentYearTotal.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}</p>
            </div>
          </div>
          
          <div className="summary-cards loan-comparison-section">
            <div className="summary-card loan-card">
              <h3>Annual Loan Cost (Comparison)</h3>
              <p className="amount loan-amount">${calculateLoanCosts.annualLoanCost.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}</p>
            </div>
            <div className="summary-card loan-card">
              <h3>Cumulative Loan Cost ({totalYears} {totalYears === 1 ? 'year' : 'years'})</h3>
              <p className="amount loan-amount">${calculateLoanCosts.cumulativeLoanCost.toLocaleString('en-US', { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              })}</p>
            </div>
          </div>
        </div>

        <div className="controls-panel">
          <h2>Variables</h2>
          
          <div className="control-group">
            <label htmlFor="totalStudents">
              Total M.D. Students Enrolled
              <span className="value-display">{totalStudents.toLocaleString()}</span>
            </label>
            <input
              id="totalStudents"
              type="range"
              min="450"
              max="550"
              step="10"
              value={totalStudents}
              onChange={(e) => setTotalStudents(Number(e.target.value))}
            />
            <div className="input-wrapper">
              <input
                type="number"
                min="450"
                max="550"
                step="10"
                value={totalStudents}
                onChange={(e) => setTotalStudents(Number(e.target.value))}
                className="number-input"
              />
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="afatPercentage">
              % Awarded AFAT
              <span className="value-display">{afatPercentage}%</span>
            </label>
            <input
              id="afatPercentage"
              type="range"
              min="0"
              max="50"
              step="1"
              value={afatPercentage}
              onChange={(e) => setAfatPercentage(Number(e.target.value))}
            />
            <div className="input-wrapper">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                value={afatPercentage}
                onChange={(e) => setAfatPercentage(Number(e.target.value))}
                className="number-input"
              />
            </div>
            <div className="calculated-info">
              {afatStudents} students × ${avgAfatAmount.toLocaleString()} = ${yearAfatTotal.toLocaleString()}
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="fwsPercentage">
              % Awarded FWS
              <span className="value-display">{fwsPercentage}%</span>
            </label>
            <input
              id="fwsPercentage"
              type="range"
              min="0"
              max="50"
              step="1"
              value={fwsPercentage}
              onChange={(e) => setFwsPercentage(Number(e.target.value))}
            />
            <div className="input-wrapper">
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                value={fwsPercentage}
                onChange={(e) => setFwsPercentage(Number(e.target.value))}
                className="number-input"
              />
            </div>
            <div className="calculated-info">
              {fwsStudents} students × ${avgFwsAmount.toLocaleString()} = ${yearFwsTotal.toLocaleString()}
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="avgAfatAmount">
              Avg AFAT Amount per Student
              <span className="value-display">${avgAfatAmount.toLocaleString()}</span>
            </label>
            <div className="fixed-value-display">
              Fixed at $3,000
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="avgFwsAmount">
              Avg FWS Amount per Student
              <span className="value-display">${avgFwsAmount.toLocaleString()}</span>
            </label>
            <input
              id="avgFwsAmount"
              type="range"
              min="3000"
              max="15000"
              step="500"
              value={avgFwsAmount}
              onChange={(e) => setAvgFwsAmount(Number(e.target.value))}
            />
            <div className="input-wrapper">
              <input
                type="number"
                min="3000"
                max="15000"
                step="500"
                value={avgFwsAmount}
                onChange={(e) => setAvgFwsAmount(Number(e.target.value))}
                className="number-input"
              />
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="totalYears">
              Total Years Projected
              <span className="value-display">{totalYears} {totalYears === 1 ? 'year' : 'years'}</span>
            </label>
            <input
              id="totalYears"
              type="range"
              min="0"
              max="30"
              step="1"
              value={totalYears}
              onChange={(e) => setTotalYears(Number(e.target.value))}
            />
            <div className="input-wrapper">
              <input
                type="number"
                min="0"
                max="30"
                step="1"
                value={totalYears}
                onChange={(e) => setTotalYears(Number(e.target.value))}
                className="number-input"
              />
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="loanInterestRate">
              Grad PLUS Loan Interest Rate
              <span className="value-display">{loanInterestRate.toFixed(2)}%</span>
            </label>
            <input
              id="loanInterestRate"
              type="range"
              min="5.30"
              max="10.50"
              step="0.01"
              value={loanInterestRate}
              onChange={(e) => setLoanInterestRate(Number(e.target.value))}
            />
            <div className="input-wrapper">
              <input
                type="number"
                min="5.30"
                max="10.50"
                step="0.01"
                value={loanInterestRate}
                onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                className="number-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
