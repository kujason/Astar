Array.prototype.contains = function(obj)
{
  var i, l = this.length;
  for (i = 0; i < l; i++)
  {
    if (this[i] == obj) return true;
  }
  return false;
};

var map =
{
	grid:new Array(this.mapHeight),
	blockWidth:50,
	blockHeight:50,
	
	createMap:
		function (xBlocks,yBlocks)
		{
			for (col=0;col<xBlocks;col++)
			{
				this.grid[col]=new Array(yBlocks);
				for (row=0;row<yBlocks;row++)
				{
					this.grid[col][row]=[];
					this.grid[col][row].x=col;
					this.grid[col][row].y=row;
					this.grid[col][row].value=1;
				}
			}
			
			var c=document.getElementById("mapCanvas");
			var ctx=c.getContext("2d");
			ctx.canvas.width = xBlocks*this.blockWidth;
			ctx.canvas.height = yBlocks*this.blockHeight;
		},

	initMap:
		function (blockWidth,blockHeight)
		{
			this.blockWidth=blockWidth;
			this.blockHeight=blockHeight;
		},
	
	drawMap:
		function(map)
		{
			var grid=map.grid;
			var c=document.getElementById("mapCanvas");
			var ctx=c.getContext("2d");
			
			for (var col=0;col<grid.length;col++)
			{
				for (var row=0;row<grid[col].length;row++)
				{
					if (this.grid[col][row].value==1)
					{
						ctx.beginPath();
						ctx.strokeStyle="blue";
						ctx.fillStyle="green";
						ctx.rect(col*this.blockWidth,row*this.blockHeight,this.blockWidth,this.blockHeight);
						ctx.stroke();
						ctx.fill();
						ctx.closePath();
					}
					else
					{
						ctx.beginPath();
						ctx.strokeStyle="red";
						ctx.fillStyle="grey";
						ctx.rect(col*this.blockWidth,row*this.blockHeight,this.blockWidth,this.blockHeight);
						ctx.stroke();
						ctx.fill();
						ctx.closePath();
					}
					ctx.fillStyle="black";
					var text=col+" "+row+"  "+this.grid[col][row].value;
					ctx.fillText(text, col*this.blockWidth,row*this.blockHeight+this.blockHeight/5);
				}
			}
		},
	
	drawPath:
		function(path)
		{
			var c=document.getElementById("mapCanvas");
			var ctx=c.getContext("2d");
			
			for (i=0;i<path.length;i++)
			{
				ctx.beginPath();
				ctx.strokeStyle="green";
				ctx.fillStyle="yellow";
				ctx.rect(path[i].x*this.blockWidth,path[i].y*this.blockHeight,this.blockWidth,this.blockHeight);
				ctx.stroke();
				ctx.fill();
				ctx.closePath();
				
				ctx.fillStyle="black";
				var text=path[i].x+" "+path[i].y+"  "+path[i].value;
				ctx.fillText(text, path[i].x*this.blockWidth,path[i].y*this.blockHeight+this.blockHeight/5);
			}
			return;
		},
	
	showInfo:
		function()
		{
			var c=document.getElementById("mapCanvas");
			var ctx=c.getContext("2d");
			
			var grid=map.grid;
			
			for (var col=0;col<grid.length;col++)
			{
				for (var row=0;row<grid[col].length;row++)
				{
					if (grid[col][row].f && grid[col][row].g && grid[col][row].h)
					{
						ctx.fillStyle="black";
						text="F: "+grid[col][row].f.toFixed(3);
						ctx.fillText(text, col*this.blockWidth,row*this.blockHeight+2*this.blockHeight/5);
						text="G: "+grid[col][row].g.toFixed(3);
						ctx.fillText(text, col*this.blockWidth,row*this.blockHeight+3*this.blockHeight/5);
						text="H: "+grid[col][row].h.toFixed(3);
						ctx.fillText(text, col*this.blockWidth,row*this.blockHeight+4*this.blockHeight/5);
					}
				}
			}
		},
}

var aStar={
	init:
		function(grid)
		{
			var grid=map.grid;
			for (x=0;x<map.grid.length;x++)
			{
				for (y=0;y<map.grid[x].length;y++)
				{
					grid[x][y].f=0;
					grid[x][y].g=0;
					grid[x][y].h=0;
					grid[x][y].parent=null;
				}
			}
		},

	findPath:
		function(startNode,endNode)
		{
			this.init(map.grid);
		
			var closedSet=[];
			var openSet=[];
			openSet.push(startNode);
			
			while (openSet.length > 0)
			{
				var lowInd = 0;
				
				//find index of lowest f
				for (i=0;i<openSet.length;i++)
				{
					if (openSet[i].f < openSet[lowInd].f)
					{
						lowInd=i;	//index of lowest f value
					}
				}
				
				var currentNode = openSet[lowInd];
				
				//if the current node is the end node, then path is found
				if (currentNode == endNode)
				{
					console.log("Found Path");
					
					var current = currentNode;
					var path = [];
					path.push(current);
					while (current.parent)
					{
						path.push(current.parent);
						current=current.parent;
					}
					return path;//showPath(came_from,goal);
				}
				
				openSet.splice(lowInd,1);
				closedSet.push(currentNode);
				
				var neighbours = this.findNeighbours(map.grid,currentNode);
				
				for (i=0;i<neighbours.length;i++)
				{
					var neighbour = neighbours[i];
					if (closedSet.contains(neighbour) || neighbour.value!=1)
					{
						continue;	//already processed or is a wall
					}
					
					var gScore=currentNode.g + 1; //g + distance to neighbour;
					var lowestG = false;
					
					if (!openSet.contains(neighbour))
					{
						lowestG = true;
						neighbour.h = this.heuristic(startNode,neighbour,endNode);
						openSet.push(neighbour);
					}
					if (gScore < neighbour.g)
					{
						lowestG = true;
					}
					
					if (lowestG)
					{
						neighbour.parent = currentNode;
						neighbour.g = gScore;
						neighbour.f = neighbour.g + neighbour.h;
					}
				}
			}
			return startNode;// couldntfind;
		},
	
	findNeighbours:
		function(grid,current)
		{
			var neighbours=[];
			var x=current.x;
			var y=current.y;
			
			//above
			if (grid[x][y-1])
			{
				neighbours.push(grid[x][y-1]);
			}
			//left
			if (grid[x-1] && grid[x-1][y])
			{
				neighbours.push(grid[x-1][y]);
			}
			//under
			if (grid[x][y+1])
			{
				neighbours.push(grid[x][y+1]);
			}
			//right
			if (grid[x+1] && grid[x+1][y])
			{
				neighbours.push(grid[x+1][y]);
			}
			
			return neighbours;
		},
	
	heuristic:
		function(start,current,end)
		{
			//Manhattan distance
			//return (Math.abs(node1.x-node2.x) + Math.abs(node1.y-node2.y));
			
			var dx1=current.x-end.x;
			var dy1=current.y-end.y;
			var dx2=start.x-end.x;
			var dy2=start.y-end.y;
			var dist=(Math.abs(current.x-end.x) + Math.abs(current.y-end.y));
			var cross=Math.abs(dx1*dy2 - dx2*dy1);
			return dist+cross*0.001;
		},
}


var blockWidth=50;
var blockHeight=50;
var numBlocksX=25;
var numBlocksY=12;
var mapWidth=blockWidth*numBlocksX;
var mapHeight=blockHeight*numBlocksY;

map.initMap(blockWidth,blockHeight);
map.createMap(numBlocksX,numBlocksY);

map.drawMap(map);

startingNode=map.grid[0][0];
endingNode=map.grid[numBlocksX-1][numBlocksY-1];

var path=aStar.findPath(startingNode,endingNode);
map.drawPath(path);

map.showInfo();

$(document).ready(function()
{
	$('#mapCanvas').mousedown(function(mEvent)
	{
		var x=Math.floor(mEvent.offsetX/blockWidth);
		var y=Math.floor(mEvent.offsetY/blockHeight);
		console.log(x,y);
		if (map.grid[x][y].value==1)
		{
			map.grid[x][y].value=2;
		}
		else
		{
			map.grid[x][y].value=1;
		}
		
		map.drawMap(map);
		path=aStar.findPath(startingNode,endingNode);
		map.drawPath(path);
		map.showInfo();
	});
});