"""
Custom FinAid Dashboard - Streamlit
Interactive tool for projecting aggregate FWS and AFAT awards over time
for M.D. students at the University of Arizona College of Medicine-Tucson.
"""

import os
import streamlit as st
import plotly.graph_objects as go

st.set_page_config(
    page_title="Custom FinAid Dashboard",
    page_icon="📊",
    layout="wide",
)

# Brand colors: navy #0C234B for text/blue, red #AB0520 for accents
NAVY = "#0C234B"
RED = "#AB0520"

# Ensure all text and UI use brand colors
st.markdown(
    f"""
    <style>
    /* Main and sidebar text */
    .stApp, .stApp label, .stMarkdown, .stMarkdown p, [data-testid="stMetricLabel"], [data-testid="stMetricValue"] {{ color: {NAVY} !important; }}
    h1, h2, h3 {{ color: {NAVY} !important; }}
    /* Main header font size */
    h1 {{ font-size: 34px !important; }}
    .stSidebar .stMarkdown, .stSidebar label {{ color: {NAVY} !important; }}
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------------------------------------------------------------------------
# Sidebar: Variables (same order as web app)
# ---------------------------------------------------------------------------
st.sidebar.header("Variables")

total_students = st.sidebar.slider(
    "Total M.D. Students Enrolled",
    min_value=450,
    max_value=550,
    value=500,
    step=10,
)

afat_pct = st.sidebar.slider(
    "% Awarded AFAT",
    min_value=0,
    max_value=50,
    value=25,
    step=1,
)

# Avg AFAT fixed at 3000
avg_afat_amount = 3000
st.sidebar.caption("Avg AFAT Amount per Student: **$3,000** (fixed)")

fws_pct = st.sidebar.slider(
    "% Awarded FWS",
    min_value=0,
    max_value=50,
    value=20,
    step=1,
)

avg_fws_amount = st.sidebar.slider(
    "Avg FWS Amount per Student",
    min_value=3000,
    max_value=15000,
    value=3000,
    step=500,
)

loan_origination_fee = st.sidebar.slider(
    "Loan Origination Fee (%)",
    min_value=0.0,
    max_value=5.0,
    value=4.228,
    step=0.01,
    format="%.2f",
)

loan_interest_rate = st.sidebar.slider(
    "Loan Interest Rate (%)",
    min_value=5.30,
    max_value=10.50,
    value=8.94,
    step=0.01,
    format="%.2f",
)

total_years = st.sidebar.slider(
    "Total Years Projected",
    min_value=0,
    max_value=30,
    value=10,
    step=1,
)

# ---------------------------------------------------------------------------
# Calculations
# ---------------------------------------------------------------------------
loan_origination_rate = loan_origination_fee / 100
loan_interest_decimal = loan_interest_rate / 100

afat_students = int(total_students * afat_pct / 100)
fws_students = int(total_students * fws_pct / 100)
year_afat_total = afat_students * avg_afat_amount
year_fws_total = fws_students * avg_fws_amount
annual_total = year_afat_total + year_fws_total

# Cumulative award amounts by year
cumulative_award_values = []
cumulative = 0
for _ in range(total_years):
    cumulative += annual_total
    cumulative_award_values.append(cumulative)

# Loan cost calculations (daily compounding)
if total_years > 0 and annual_total > 0:
    annual_borrowed = annual_total / (1 - loan_origination_rate)
    annual_origination_fee = annual_borrowed * loan_origination_rate
    daily_rate = loan_interest_decimal / 365

    # Annual loan cost (one year)
    annual_interest = annual_borrowed * (pow(1 + daily_rate, 365) - 1)
    annual_loan_cost = annual_origination_fee + annual_interest

    # Cumulative loan cost at end of each year (for chart)
    cumulative_loan_cost_by_year = []
    for k in range(1, total_years + 1):
        origination_through_k = annual_origination_fee * k
        interest_through_k = 0
        for j in range(1, k + 1):
            years_remaining = k - j + 1
            days_remaining = years_remaining * 365
            interest_through_k += annual_borrowed * (
                pow(1 + daily_rate, days_remaining) - 1
            )
        cumulative_loan_cost_by_year.append(origination_through_k + interest_through_k)

    total_origination_fees = annual_origination_fee * total_years
    cumulative_interest = sum(
        annual_borrowed * (pow(1 + daily_rate, (total_years - j + 1) * 365) - 1)
        for j in range(1, total_years + 1)
    )
    cumulative_loan_cost = total_origination_fees + cumulative_interest

    # Grant + loan cost for red line
    award_plus_loan_values = [
        cumulative_award_values[i] + cumulative_loan_cost_by_year[i]
        for i in range(total_years)
    ]
else:
    annual_loan_cost = 0
    cumulative_loan_cost = 0
    cumulative_loan_cost_by_year = []
    award_plus_loan_values = []

current_year_total = cumulative_award_values[-1] if cumulative_award_values else 0
year_label = "year" if total_years == 1 else "years"

# ---------------------------------------------------------------------------
# Header with logos
# ---------------------------------------------------------------------------
# Paths to logos (in repo: place logo-left.png and logo-right.png in public/)
LOGO_LEFT = "public/logo-left.png"
LOGO_RIGHT = "public/logo-right.png"

logo_left_ok = os.path.isfile(LOGO_LEFT)
logo_right_ok = os.path.isfile(LOGO_RIGHT)

col_logo_left, col_title, col_logo_right = st.columns([1, 2, 1])

# Logo display widths (pixels)
LOGO_WIDTH_LEFT = 310
LOGO_WIDTH_RIGHT = 240

with col_logo_left:
    if logo_left_ok:
        st.image(LOGO_LEFT, width=LOGO_WIDTH_LEFT)
    else:
        st.write("")

with col_title:
    st.title("Abhijay's Custom Financial Aid Projector")
    st.markdown(
        "Interactive tool for projecting aggregate Federal Work Study (FWS) and "
        "Arizona Financial Aid Trust (AFAT) awards over time for M.D. students at "
        "the University of Arizona College of Medicine–Tucson."
    )

with col_logo_right:
    if logo_right_ok:
        st.image(LOGO_RIGHT, width=LOGO_WIDTH_RIGHT)
    else:
        st.write("")

st.markdown("---")

# ---------------------------------------------------------------------------
# Chart
# ---------------------------------------------------------------------------
if total_years > 0 and cumulative_award_values:
    years_labels = [f"Year {i + 1}" for i in range(total_years)]

    fig = go.Figure()

    # Brand colors: blue/navy #0C234B, red #AB0520
    COLOR_NAVY = "#0C234B"
    COLOR_RED = "#AB0520"

    fig.add_trace(
        go.Scatter(
            x=years_labels,
            y=cumulative_award_values,
            name="Cumulative Award Amount",
            mode="lines+markers",
            line=dict(color=COLOR_NAVY, width=2),
            fill="tozeroy",
            fillcolor="rgba(12, 35, 75, 0.12)",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=years_labels,
            y=award_plus_loan_values,
            name="Award Amount + Loan Cost",
            mode="lines+markers",
            line=dict(color=COLOR_RED, width=2),
            fill="tonexty",
            fillcolor="rgba(171, 5, 32, 0.15)",
        )
    )

    fig.update_layout(
        title="Aggregate Dollar Amount Over Time",
        xaxis_title="",
        yaxis_title="Amount ($)",
        yaxis_tickformat="$,.0f",
        hovermode="x unified",
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(color=COLOR_NAVY),
        ),
        margin=dict(t=60),
        height=500,
        font=dict(color=COLOR_NAVY),
        title_font=dict(color=COLOR_NAVY),
        xaxis=dict(tickfont=dict(color=COLOR_NAVY)),
        yaxis=dict(tickfont=dict(color=COLOR_NAVY)),
    )

    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("Set **Total Years Projected** above 0 to see the chart.")

# ---------------------------------------------------------------------------
# Summary cards
# ---------------------------------------------------------------------------
st.markdown("### Award totals")
col1, col2 = st.columns(2)
with col1:
    st.metric("Annual Total", f"${annual_total:,.0f}")
with col2:
    st.metric(f"Cumulative Total ({total_years} {year_label})", f"${current_year_total:,.0f}")

st.markdown("### Loan costs")
col3, col4 = st.columns(2)
with col3:
    st.metric("Annual Loan Cost (Comparison)", f"${annual_loan_cost:,.0f}")
with col4:
    st.metric(
        f"Cumulative Loan Cost ({total_years} {year_label})",
        f"${cumulative_loan_cost:,.0f}",
    )

st.markdown("### Total Economic Impact")
annual_impact = annual_total + annual_loan_cost
cumulative_impact = current_year_total + cumulative_loan_cost
col5, col6 = st.columns(2)
with col5:
    st.metric("Annual Total Economic Impact", f"${annual_impact:,.0f}")
with col6:
    st.metric(
        f"Cumulative Total Economic Impact ({total_years} {year_label})",
        f"${cumulative_impact:,.0f}",
    )
