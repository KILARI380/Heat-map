// Fetch the dataset
d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(function(data) {
        const dataset = data;

        // Dimensions for the heatmap
        const width = 800;
        const height = 600;
        const cellWidth = 20;
        const cellHeight = 20;
        const margin = { top: 50, right: 50, bottom: 100, left: 50 };

        // Create SVG container
        const svg = d3.select("#heatmap")
            .attr("width", width)
            .attr("height", height);

        // Extract the years and months from the dataset
        const years = d3.range(dataset.monthlyVariance.length).map(d => dataset.monthlyVariance[d].year);
        const months = d3.range(1, 13);

        // Set up scales for the axes
        const xScale = d3.scaleBand()
            .domain(years)
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const yScale = d3.scaleBand()
            .domain(months)
            .range([margin.top, height - margin.bottom])
            .padding(0.1);

        // Create axes
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.format("d"))
            .ticks(10);

        const yAxis = d3.axisLeft(yScale)
            .tickFormat(d => d3.timeFormat("%B")(new Date(0, d - 1)))
            .ticks(12);

        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(xAxis);

        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);

        // Define the color scale for the heatmap cells
        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([
                d3.min(dataset.monthlyVariance, d => d.variance),
                d3.max(dataset.monthlyVariance, d => d.variance)
            ]);

        // Create the heatmap cells
        const cells = svg.selectAll(".cell")
            .data(dataset.monthlyVariance)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.month))
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("data-month", d => d.month - 1)
            .attr("data-year", d => d.year)
            .attr("data-temp", d => dataset.baseTemperature + d.variance)
            .style("fill", d => colorScale(d.variance))
            .on("mouseover", function(event, d) {
                const temp = dataset.baseTemperature + d.variance;
                d3.select("#tooltip")
                    .style("visibility", "visible")
                    .html(`Year: ${d.year}<br>Month: ${d3.timeFormat("%B")(new Date(0, d.month - 1))}<br>Temperature: ${temp.toFixed(2)}°C`)
                    .attr("data-year", d.year)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY + 10) + "px");
            })
            .on("mouseout", function() {
                d3.select("#tooltip").style("visibility", "hidden");
            });

        // Create legend
        const legend = d3.select("#legend");
        const legendWidth = 200;
        const legendHeight = 20;
        const legendData = colorScale.ticks(4);

        const legendScale = d3.scaleLinear()
            .domain([legendData[0], legendData[legendData.length - 1]])
            .range([0, legendWidth]);

        const legendSvg = legend.append("svg")
            .attr("width", legendWidth)
            .attr("height", legendHeight);

        legendSvg.selectAll("rect")
            .data(legendData)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * (legendWidth / legendData.length))
            .attr("width", legendWidth / legendData.length)
            .attr("height", legendHeight)
            .style("fill", d => colorScale(d));

        // Add the color scale labels
        legendSvg.append("g")
            .attr("transform", `translate(0, ${legendHeight})`)
            .selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", (d, i) => i * (legendWidth / legendData.length))
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text(d => d.toFixed(2));
    });
