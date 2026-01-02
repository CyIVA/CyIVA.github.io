document.addEventListener('DOMContentLoaded', () => {
    let resizeTimeout;
    renderHistoryChart();

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(renderHistoryChart, 200);
    });
});

function getLayoutSettings() {
    const width = window.innerWidth;
    // Mobile Breakpoint (e.g. 768px)
    if (width < 768) {
        return {
            labelLeftPct: 55,       // Labels start at 55%
            trackWidthFactor: 50,   // Tracks fit within left 50%
            separatorPos: 52,       // Dashed line at 52%
            labelFontSize: '0.75rem',
            paddingRight: 10        // Add some right padding for labels
        };
    } else {
        return {
            labelLeftPct: 70,       // Labels start at 70%
            trackWidthFactor: 60,   // Tracks fit within left 60%
            separatorPos: 65,       // Dashed line at 65%
            labelFontSize: '0.85rem',
            paddingRight: 20
        };
    }
}

function renderHistoryChart() {
    const chartContainer = document.getElementById('vertical-history');
    if (!chartContainer) return;
    
    // Clear previous render
    chartContainer.innerHTML = '';
    
    const data = window.historyData;
    if (!data || data.length === 0) return;

    const layout = getLayoutSettings();

    // 1. Sort by start date
    const parsedData = data.map(item => {
      const startDate = new Date(item.start);
      let endDate = item.end ? new Date(item.end) : new Date();
      if (isNaN(endDate.getTime())) endDate = new Date();
      
      return {
        title: item.title,
        start: startDate,
        end: endDate
      };
    }).sort((a, b) => a.start - b.start);
  
    // 2. Global Date Range
    let minDate = parsedData[0].start;
    let maxDate = parsedData[0].end;
  
    parsedData.forEach(item => {
      if (item.start < minDate) minDate = item.start;
      if (item.end > maxDate) maxDate = item.end;
    });
  
    const now = new Date();
    if (now > maxDate) maxDate = now;

    // Buffer: Start -2 months, End +2 months
    minDate = new Date(minDate.getFullYear(), minDate.getMonth() - 2, 1);
    maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
  
    const totalDuration = maxDate - minDate;
  
    // 3. Track Packing Logic
    const tracks = []; 
  
    parsedData.forEach(item => {
      let placed = false;
      for (let i = 0; i < tracks.length; i++) {
          if (tracks[i] < item.start) {
              item.trackIndex = i;
              tracks[i] = item.end;
              placed = true;
              break;
          }
      }
      if (!placed) {
          item.trackIndex = tracks.length;
          tracks.push(item.end);
      }
    });
  
    const trackCount = tracks.length;
    
    // Height Logic: 0.75px per day
    const chartHeight = (totalDuration / (1000 * 60 * 60 * 24)) * 0.75;
    chartContainer.style.height = `${chartHeight}px`;

    // SVG Container for Lines
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "vh-connections");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    chartContainer.appendChild(svg);
    
    // Grid Lines & Year Markers
    const gridContainer = document.createElement('div');
    gridContainer.className = 'vh-grid';
    // Update separator line position via CSS variable or direct style?
    // Let's use direct style injection or update the class behavior.
    // Changing the pseudo-element position via JS is hard. 
    // Easier strategy: Apppend a separator element instead of using ::after, OR update CSS custom property.
    chartContainer.style.setProperty('--vh-separator-pos', `${layout.separatorPos}%`);
    
    // Render Years
    for (let y = minDate.getFullYear(); y <= maxDate.getFullYear(); y++) {
        const yearDate = new Date(y, 0, 1);
        if (yearDate < minDate || yearDate > maxDate) continue;
        
        const topPercent = ((maxDate - yearDate) / totalDuration) * 100;
        
        const yearLine = document.createElement('div');
        yearLine.className = 'vh-year-line';
        yearLine.style.top = `${topPercent}%`;
        
        const yearLabel = document.createElement('div');
        yearLabel.className = 'vh-year-label';
        yearLabel.innerText = y;
        yearLabel.style.top = `${topPercent}%`;
        
        gridContainer.appendChild(yearLine);
        gridContainer.appendChild(yearLabel);
    }
    
    // Render "Now" Line
    if (now >= minDate && now <= maxDate) {
        const nowTop = ((maxDate - now) / totalDuration) * 100;
        
        const nowLine = document.createElement('div');
        nowLine.className = 'vh-now-line';
        nowLine.style.top = `${nowTop}%`;
        
        const nowLabel = document.createElement('div');
        nowLabel.className = 'vh-now-label';
        nowLabel.innerText = `NOW (${now.getFullYear()}.${now.getMonth()+1})`;
        nowLabel.style.top = `${nowTop}%`;
        
        gridContainer.appendChild(nowLine);
        gridContainer.appendChild(nowLabel);
    }

    for (let i = 0; i < trackCount; i++) {
        const line = document.createElement('div');
        line.className = 'vh-track-line';
        line.style.left = `${getTrackLeft(i, trackCount, layout.trackWidthFactor)}%`;
        gridContainer.appendChild(line);
    }
    chartContainer.appendChild(gridContainer);
  
    // Store label info for collision resolution
    const labels = [];
    
    // 4. Render Capsules & Prepare Labels
    parsedData.forEach((item, index) => {
        const capsule = document.createElement('div');
        capsule.className = 'vh-capsule';
        capsule.style.backgroundColor = stringToColor(item.title);
        
        const topPercent = ((maxDate - item.end) / totalDuration) * 100;
        const heightPercent = ((item.end - item.start) / totalDuration) * 100;
        const leftPercent = getTrackLeft(item.trackIndex, trackCount, layout.trackWidthFactor);
  
        capsule.style.top = `${topPercent}%`;
        capsule.style.height = `${heightPercent}%`;
        
        // Track Lines center logic
        capsule.style.left = `calc(${leftPercent}% - 10px)`; 
  
        chartContainer.appendChild(capsule);
        
        // Prepare Label
        const idealYPercent = topPercent + (heightPercent / 2);
        
        labels.push({
            id: index,
            element: null,
            text: item.title,
            idealY: idealYPercent,
            currentY: idealYPercent, 
            height: 0, 
            color: stringToColor(item.title),
            
            // Connection points (For SVG)
            capsuleRightX: leftPercent, 
            
            // Reference for hover sync
            capsuleElement: capsule,
            start: item.start,
            end: item.end
        });
    });

    // 5. Label Collision Resolution
    const chartH = chartHeight;
    labels.forEach(l => {
        l.idealYPx = (l.idealY / 100) * chartH;
        l.currentYPx = l.idealYPx;
        l.heightPx = 30; 
    });

    // Sort by ideal Y
    labels.sort((a, b) => a.idealYPx - b.idealYPx);

    // Shift down
    for (let i = 1; i < labels.length; i++) {
        const prev = labels[i-1];
        const curr = labels[i];
        
        if (curr.currentYPx < prev.currentYPx + prev.heightPx + 8) { 
             curr.currentYPx = prev.currentYPx + prev.heightPx + 8;
        }
    }

    // 6. Render Labels & Connectors
    labels.forEach(l => {
        // Label Element
        const labelEl = document.createElement('div');
        labelEl.className = 'vh-label';
        labelEl.innerText = l.text;
        
        // Dynamic styling
        labelEl.style.fontSize = layout.labelFontSize;

        // Position
        labelEl.style.top = `${l.currentYPx}px`;
        labelEl.style.left = `${layout.labelLeftPct}%`;
        labelEl.style.right = `${layout.paddingRight}px`; // Constrain right edge
        
        // Hover Sync Logic
        const setHover = (active) => {
            if (active) {
                l.capsuleElement.classList.add('hovered');
                labelEl.classList.add('hovered');
                l.dateStartEl.classList.add('visible');
                l.dateEndEl.classList.add('visible');
            } else {
                l.capsuleElement.classList.remove('hovered');
                labelEl.classList.remove('hovered');
                l.dateStartEl.classList.remove('visible');
                l.dateEndEl.classList.remove('visible');
            }
        };

        l.capsuleElement.addEventListener('mouseenter', () => setHover(true));
        l.capsuleElement.addEventListener('mouseleave', () => setHover(false));
        labelEl.addEventListener('mouseenter', () => setHover(true));
        labelEl.addEventListener('mouseleave', () => setHover(false));
        
        chartContainer.appendChild(labelEl);
        
        // Create Date Labels
        const formatDate = (date) => `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        const topPercent = ((maxDate - l.end) / totalDuration) * 100;
        const heightPercent = ((l.end - l.start) / totalDuration) * 100;
        const leftPercent = l.capsuleRightX; 
        
        const dateEndEl = document.createElement('div');
        dateEndEl.className = 'vh-date-label vh-date-end';
        dateEndEl.innerText = formatDate(l.end);
        dateEndEl.style.top = `${topPercent}%`;
        dateEndEl.style.left = `${leftPercent}%`;
        
        const dateStartEl = document.createElement('div'); 
        dateStartEl.className = 'vh-date-label vh-date-start';
        dateStartEl.innerText = formatDate(l.start);
        dateStartEl.style.top = `${topPercent + heightPercent}%`;
        dateStartEl.style.left = `${leftPercent}%`;
        
        l.dateStartEl = dateStartEl;
        l.dateEndEl = dateEndEl;
        
        chartContainer.appendChild(dateStartEl);
        chartContainer.appendChild(dateEndEl);
        
        // Draw Connection
        const capsuleTopPx = (topPercent / 100) * chartH;
        const capsuleBottomPx = ((topPercent + heightPercent) / 100) * chartH;
        
        let connectionY = l.currentYPx;
        if (connectionY < capsuleTopPx) connectionY = capsuleTopPx;
        if (connectionY > capsuleBottomPx) connectionY = capsuleBottomPx;

        const line = document.createElementNS(svgNS, "line");
        
        // Source
        line.setAttribute("x1", `calc(${l.capsuleRightX}% + 12px)`); 
        line.setAttribute("y1", `${connectionY}px`);
        
        // Target (Dynamic x2)
        line.setAttribute("x2", `${layout.labelLeftPct}%`); 
        line.setAttribute("y2", `${l.currentYPx}px`); 
        
        line.setAttribute("stroke", l.color);
        line.setAttribute("stroke-width", "1");
        line.setAttribute("opacity", "0.6");
        
        svg.appendChild(line);
    });
}

function getTrackLeft(index, total, totalWidthPct) {
    if (total === 0) return 0;
    const widthPerTrack = totalWidthPct / total; 
    return (index * widthPerTrack) + (widthPerTrack / 2) + 5; // +5% padding
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash % 360);
  const s = 60 + (Math.abs(hash) % 30); 
  const l = 50 + (Math.abs(hash) % 40); 
  return `hsl(${h}, ${s}%, ${l}%)`;
}
