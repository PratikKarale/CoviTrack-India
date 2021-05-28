let a = document.querySelectorAll(".monthData");
let b = document.querySelectorAll(".monthDates");

let monthDataArray = [];
let monthDatesArray = [];

for (var i = 0; i < a.length; i++) {
  monthDataArray.push(a[i].innerText);
}

for (var i = 0; i < b.length; i++) {
  monthDatesArray.push(b[i].innerText);
}

console.log(a);

var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: monthDatesArray,
    datasets: [
      {
        type: "line",
        data: monthDataArray,
        lineTension: 0.2,
        backgroundColor: "transparent",
        borderColor: "#007bff",
        borderWidth: 2,
        pointBackgroundColor: "#007bff",
        pointRadius: 3,
        backgroundColor: "#007bff20",
      },
    ],
  },

  options: {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: false,
            maxTicksLimit: 5
          },
        },
      ],

      xAxes: [
        {
          gridLines: {
            display: false,
          },
        },
      ],
    },

    legend: {
      display: false,
    },
  },
});