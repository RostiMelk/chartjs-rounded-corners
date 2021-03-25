/*
 *   Rounded Rectangle Extension for Bar Charts
 *   Tested with Charts.js 2.8.0
 * 
 */
Chart.elements.Rectangle.prototype.draw = function () {
	var ctx = this._chart.ctx;
	var vm = this._view;
	var left, right, top, bottom, signX, signY, borderSkipped, radius;
	var borderWidth = vm.borderWidth;
	// Set Radius Here
	// If radius is large enough to cause drawing errors a max radius is imposed
	var cornerRadius = this._chart.config.options.cornerRadius;

    // Individual radius
	var cornerRadiusTopLeft = this._chart.config.options.cornerRadiusTopLeft;
	var cornerRadiusTopRight = this._chart.config.options.cornerRadiusTopRight;
	var cornerRadiusBottomLeft = this._chart.config.options.cornerRadiusBottomLeft;
	var cornerRadiusBottomRight = this._chart.config.options.cornerRadiusBottomRight;

	if (cornerRadius < 0) {
		cornerRadius = 0;
	}
	if (typeof cornerRadius == 'undefined') {
		cornerRadius = 0;
	}

	if (!vm.horizontal) {
		// bar
		left = vm.x - vm.width / 2;
		right = vm.x + vm.width / 2;
		top = vm.y;
		bottom = vm.base;
		signX = 1;
		signY = bottom > top ? 1 : -1;
		borderSkipped = vm.borderSkipped || 'bottom';
	} else {
		// horizontal bar
		left = vm.base;
		right = vm.x;
		top = vm.y - vm.height / 2;
		bottom = vm.y + vm.height / 2;
		signX = right > left ? 1 : -1;
		signY = 1;
		borderSkipped = vm.borderSkipped || 'left';
	}

	// Canvas doesn't allow us to stroke inside the width so we can
	// adjust the sizes to fit if we're setting a stroke on the line
	if (borderWidth) {
		// borderWidth shold be less than bar width and bar height.
		var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
		borderWidth = borderWidth > barSize ? barSize : borderWidth;
		var halfStroke = borderWidth / 2;
		// Adjust borderWidth when bar top position is near vm.base(zero).
		var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
		var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
		var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
		var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
		// not become a vertical line?
		if (borderLeft !== borderRight) {
			top = borderTop;
			bottom = borderBottom;
		}
		// not become a horizontal line?
		if (borderTop !== borderBottom) {
			left = borderLeft;
			right = borderRight;
		}
	}

	ctx.beginPath();
	ctx.fillStyle = vm.backgroundColor;
	ctx.strokeStyle = vm.borderColor;
	ctx.lineWidth = borderWidth;

	// Corner points, from bottom-left to bottom-right clockwise
	// | 1 2 |
	// | 0 3 |
	var corners = [
		[left, bottom],
		[left, top],
		[right, top],
		[right, bottom],
	];

	// Find first (starting) corner with fallback to 'bottom'
	var borders = ['bottom', 'left', 'top', 'right'];
	var startCorner = borders.indexOf(borderSkipped, 0);
	if (startCorner === -1) {
		startCorner = 0;
	}

	function cornerAt(index) {
		return corners[(startCorner + index) % 4];
	}

	// Draw rectangle from 'startCorner'
	var corner = cornerAt(0);
	ctx.moveTo(corner[0], corner[1]);

	for (var i = 1; i < 4; i++) {
		corner = cornerAt(i);
		nextCornerId = i + 1;
		if (nextCornerId == 4) {
			nextCornerId = 0;
		}

		nextCorner = cornerAt(nextCornerId);

		width = corners[2][0] - corners[1][0];
		height = corners[0][1] - corners[1][1];
		x = corners[1][0];
		y = corners[1][1];

		var radius = cornerRadius;
		var radius_tl = typeof cornerRadiusTopLeft !== 'undefined' ? cornerRadiusTopLeft : radius;
		var radius_tr = typeof cornerRadiusTopRight !== 'undefined' ? cornerRadiusTopRight : radius;
		var radius_bl = typeof cornerRadiusBottomLeft !== 'undefined' ? cornerRadiusBottomLeft : radius;
		var radius_br = typeof cornerRadiusBottomRight !== 'undefined' ? cornerRadiusBottomRight : radius;

		function fixLargeRadius(radius, width, height) {
			if (radius > height / 2) {
				radius = height / 2;
			}
			if (radius > width / 2) {
				radius = width / 2;
			}
			return radius;
		}

		radius = fixLargeRadius(radius, width, height);
		radius_tl = fixLargeRadius(radius_tl, width, height);
		radius_tr = fixLargeRadius(radius_tr, width, height);
		radius_bl = fixLargeRadius(radius_bl, width, height);
		radius_br = fixLargeRadius(radius_br, width, height);

		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius_tr, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius_tr);
		ctx.lineTo(x + width, y + height - radius_br);
		ctx.quadraticCurveTo(x + width, y + height, x + width - radius_br, y + height);
		ctx.lineTo(x + radius_bl, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius_bl);
		ctx.lineTo(x, y + radius_tl);
		ctx.quadraticCurveTo(x, y, x + radius_tl, y);
	}

	ctx.fill();
	if (borderWidth) {
		ctx.stroke();
	}
};
