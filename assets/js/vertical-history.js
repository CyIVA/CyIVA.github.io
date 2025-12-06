document.addEventListener('DOMContentLoaded', () => {
    const chartContainer = document.getElementById('vertical-history');
    const data = window.historyData;
  
    if (!data || data.length === 0) return;
  
    // 1. Sort by start date
    const parsedData = data.map(item => {
      const startDate = new Date(item.start);
      let endDate = item.end ? new Date(item.end) : new Date();
      // Check for invalid date (e.g. empty string resulting in Invalid Date)
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
    
    // Height Logic: 0.75px per day (Reduced by half)
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
        line.style.left = `${getTrackLeft(i, trackCount)}%`;
        gridContainer.appendChild(line);
    }
    chartContainer.appendChild(gridContainer);
  
    // Store label info for collision resolution
    const labels = [];
    const containerRect = chartContainer.getBoundingClientRect(); // Need container width logic if possible, or use %
    
    // We assume chart width for labels is distinct.
    // Tracks take up left 60%. Labels sit in right 35%.
    
    // 4. Render Capsules & Prepare Labels
    parsedData.forEach((item, index) => {
        const capsule = document.createElement('div');
        capsule.className = 'vh-capsule';
        capsule.style.backgroundColor = stringToColor(item.title);
        
        const topPercent = ((maxDate - item.end) / totalDuration) * 100;
        const heightPercent = ((item.end - item.start) / totalDuration) * 100;
        const leftPercent = getTrackLeft(item.trackIndex, trackCount);
  
        capsule.style.top = `${topPercent}%`;
        capsule.style.height = `${heightPercent}%`;
        
        // Slightly offset track lines logic in getTrackLeft to ensure center
        // Let's say getTrackLeft returns CENTER % of track.
        capsule.style.left = `calc(${leftPercent}% - 10px)`; // Center 20px bar
  
        chartContainer.appendChild(capsule);
        
        // Prepare Label
        // Ideal Y = Center of capsule
        const idealYPercent = topPercent + (heightPercent / 2);
        
        labels.push({
            id: index,
            element: null, // to be created
            text: item.title,
            idealY: idealYPercent,
            currentY: idealYPercent, // in %
            height: 0, // will measure
            color: stringToColor(item.title),
            
            // Connection points
            capsuleRightX: leftPercent, // % roughly
            capsuleCenterY: idealYPercent, // %
            
            capsuleCenterY: idealYPercent, // %
            
            // Reference for hover sync
            capsuleElement: capsule,
            start: item.start,
            end: item.end
        });
    });

    // 5. Label Collision Resolution
    // convert % to rough px for height est? Or just use % stacking.
    // % is hard because height of text is fixed PX.
    // Let's use PX for logic.
    const chartH = chartHeight;
    labels.forEach(l => {
        l.idealYPx = (l.idealY / 100) * chartH;
        l.currentYPx = l.idealYPx;
        l.heightPx = 30; // Increased height buffer (was 24)
    });

    // Sort by ideal Y
    labels.sort((a, b) => a.idealYPx - b.idealYPx);

    // Shift down
    for (let i = 1; i < labels.length; i++) {
        const prev = labels[i-1];
        const curr = labels[i];
        
        // Overlap logic: Ensure centers are at least heightPx + padding apart
        if (curr.currentYPx < prev.currentYPx + prev.heightPx + 8) { // Increased padding to 8px
             curr.currentYPx = prev.currentYPx + prev.heightPx + 8;
        }
    }

    // 6. Render Labels & Connectors
    labels.forEach(l => {
        // Label Element
        const labelEl = document.createElement('div');
        labelEl.className = 'vh-label';
        labelEl.innerText = l.text;
        // labelEl.style.color = l.color; // Colored text? or Border?
        // Let's keep white text, colored border or dot.
        
        // Position
        labelEl.style.top = `${l.currentYPx}px`;
        // Left is fixed area, e.g. 70%
        labelEl.style.left = '70%'; 
        
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
        
        // Create Date Labels (Hidden by default)
        const formatDate = (date) => `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        // Recalculate positions for this scope
        const topPercent = ((maxDate - l.end) / totalDuration) * 100;
        const heightPercent = ((l.end - l.start) / totalDuration) * 100;
        const leftPercent = l.capsuleRightX; // Start with center
        
        const dateEndEl = document.createElement('div'); // Future (Top)
        dateEndEl.className = 'vh-date-label vh-date-end';
        dateEndEl.innerText = formatDate(l.end);
        dateEndEl.style.top = `${topPercent}%`;
        dateEndEl.style.left = `${leftPercent}%`;
        
        const dateStartEl = document.createElement('div'); // Past (Bottom)
        dateStartEl.className = 'vh-date-label vh-date-start';
        dateStartEl.innerText = formatDate(l.start);
        dateStartEl.style.top = `${topPercent + heightPercent}%`;
        dateStartEl.style.left = `${leftPercent}%`;
        
        l.dateStartEl = dateStartEl;
        l.dateEndEl = dateEndEl;
        
        chartContainer.appendChild(dateStartEl);
        chartContainer.appendChild(dateEndEl);
        
        // Draw Connection
        // From: Capsule (l.capsuleRightX %, l.capsuleCenterY %)
        // To: Label (70%, l.currentYPx)
        
        const line = document.createElementNS(svgNS, "line");
        // Coordinates need to be absolute relative to SVG?
        // SVG is 100% size.
        // We can use x1="50%" etc.
        
        // Source
        line.setAttribute("x1", `calc(${l.capsuleRightX}% + 12px)`); // Edge of capsule (center + 10px + padding)
        line.setAttribute("y1", `${l.capsuleCenterY}%`);
        
        // Target - label is vertically centered at currentYPx usually? 
        // Our logic placed TOP at currentYPx? No, let's assume currentYPx is Top.
        // Let's aim for middle of label: currentYPx + height/2
        
        line.setAttribute("x2", "70%"); // Start of label area
        line.setAttribute("y2", `${l.currentYPx}px`); // Middle of 24px label
        
        line.setAttribute("stroke", l.color);
        line.setAttribute("stroke-width", "1");
        line.setAttribute("opacity", "0.6");
        
        svg.appendChild(line);
    });
  
  });
  
  function getTrackLeft(index, total) {
      const widthPerTrack = 60 / total; // Use left 60%
      return (index * widthPerTrack) + (widthPerTrack / 2) + 5; // +5% padding from left
  }
  
  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    // Dynamic HSL: Saturation 60-89%, Lightness 50-90% (Brighter than categories)
    const s = 60 + (Math.abs(hash) % 30); 
    const l = 50 + (Math.abs(hash) % 40); 
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  
