//v0.1.0

/** History
0.1.0: creation of this test file
*/

/** Note
(i, j) coords are relative to a double array board[i][j] so (i, 1) corresponds to the black group in the following example:
	var clear_territory_board = [
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ],
                [ e  , B  , e  , W  , e  , e  ]
            ];
*/

var e = ScoreBoard.EMPTY;
var B = ScoreBoard.BLACK;
var W = ScoreBoard.WHITE;
var D = ScoreBoard.TERRITORY_DAME;
var BD = ScoreBoard.BLACK_DEAD;
var WD = ScoreBoard.WHITE_DEAD;
var BA = ScoreBoard.BLACK_ALIVE;
var WA = ScoreBoard.WHITE_ALIVE;
var TB = ScoreBoard.TERRITORY_BLACK;
var TW = ScoreBoard.TERRITORY_WHITE;
var TU = ScoreBoard.TERRITORY_UNKNOWN;
var KB = ScoreBoard.TERRITORY_KO_BLACK;
var KW = ScoreBoard.TERRITORY_KO_WHITE;
var U = "?";

function are_equal_boards(board1, board2){
  
	for(var i=0;i<board1.length;i++){
		for(var j=0;j<board1[i].length;j++){
			if(board1[i][j] != board2[i][j]){ 
				return false;
			}
		}
	}
	return true;
}

//allow U as a wildcard
function are_similar_boards(board1, board2){
  
	for(var i=0;i<board1.length;i++){
		for(var j=0;j<board1[i].length;j++){
			if(board2[i][j] == U){ 
				continue;
			}
			if(board1[i][j] != board2[i][j]){ 
				return false;
			}
		}
	}
	return true;
}


test("BoardExactAnalysis should int group properties correctly", function(){

	var test_board = [
                [ e  , B  , W , W  , W , B  ],
                [ e  , B  , e  , W  , e  , W ],
                [ B  , B  , W , W  , W , e  ],
                [ e  , B  , B  , W  , W , W ],
                [ e  , e  , B  , W  , W , W ],
                [WD, B  , B  , W  ,BD, e  ]
            ];

	var scoreboard = new BoardExactAnalysis(test_board, 0.5, 0, 0);
	var findgroups = new FindGroups(test_board);

	var groups = findgroups.getBoardArray();
	var expected_result = [
                [ "T0" , "B0" , "W0" , "W0" , "W0" , "B1"  ],
                [ "T0" , "B0" , "T1" , "W0"  , "T2" , "W1" ],
                [ "B0" , "B0" , "W0" , "W0" , "W0" , "T3" ],
                [ "T4" , "B0" , "B0" , "W0" , "W0" , "W0" ],
                [ "T4" , "T4" , "B0" , "W0" , "W0" , "W0" ],
                [ "W2" , "B0" , "B0" , "W0" , "B2"  , "T5" ]
            ];

	ok(are_equal_boards(groups, expected_result));
	
	ok(scoreboard.groupNames[ScoreBoard.getKey(0, 0)] == "T0");
	ok(scoreboard.groupNames[ScoreBoard.getKey(4, 4)] == "W0");
	ok(scoreboard.groupNames[ScoreBoard.getKey(5, 4)] == "B2");

	ok(scoreboard.groupCoords["W0"].length == (14*2));
	ok(scoreboard.groupLibCoords["W2"].length == (1*2));
	
	var expectedNeighbors = ["T0", "W0", "T1", "T4", "W2"];
	var testOk = true;
	for(var i=0; i<5; i++) {
		if(scoreboard.groupNeighbors["B0"][expectedNeighbors[i]] != true) {
			testOk = false;
		}
	}
	ok(testOk);
	
	ok(scoreboard.metagroupCount == 12);
	ok(scoreboard.metagroupChilds[scoreboard.metagroupName["B0"]][0] == "B0");
	ok(scoreboard.metagroupProperties[scoreboard.metagroupName["W2"]][BoardExactAnalysis.PROPERTY_METAGROUP_IS_DEAD] == true);
});


test("BoardExactAnalysis should find some dame territories ", function(){

	var test_board1 = [
                [ e , B , B , e , W , B ],
                [ e , B , e , W , W , e ],
                [ B , B , e , W , e , e ],
                [ e , B , e , W , e , e ],
                [ B , B , e , W , e , e ],
                [ e , e , W , e , B , e ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);

	scoreboard1.findDame(false);

	var analysedBoard1 = scoreboard1.getBoardArray();
	var expected_result1 = [
                [ e , B , B , D , W , B ],
                [ e , B , D , W , W , D ],
                [ B , B , D , W , e , e ],
                [ e , B , D , W , e , e ],
                [ B , B , D , W , D , e ],
                [ e , D , W , D , B , e ]
            ];

	ok(are_similar_boards(analysedBoard1, expected_result1));
    
	var test_board2 = [
                [ e  , BA , BA , e  , WA , BD ],
                [ e  , BA , e  , WA , WA , e  ],
                [ BA , BA , e  , WA , e  , e  ],
                [ e  , BA , e  , WA , e  , e  ],
                [ BA , BA , e  , WA , e  , e  ],
                [ e  , e  , W , e  , BD , e  ]
            ];

	var scoreboard2 = new BoardExactAnalysis(test_board2, 0.5, 0, 0);

	scoreboard2.findDame(true);

	var analysedBoard2 = scoreboard2.getBoardArray();
	var expected_result2 = [
                [ e  , BA , BA , D  , WA , BD ],
                [ e  , BA , D  , WA , WA , e  ],
                [ BA , BA , D  , WA , e  , e  ],
                [ e  , BA , D  , WA , e  , e  ],
                [ BA , BA , D  , WA , e  , e  ],
                [ e  , e  , W , e  , BD , e  ]
            ];

	ok(are_similar_boards(analysedBoard2, expected_result2));
    
});

test("BoardExactAnalysis should mark alive groups next to marked-as-dead group", function(){

	var test_board1 = [
                [ e , B , B , e , W , BD],
                [ e , B , e , e , W , e ],
                [ B , B , e , W , e , e ],
                [ e , e , e , W , e , e ],
                [ B , B , e , W , e , e ],
                [ WD, e , W , e , B , e ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);

	ok(scoreboard1.getGroupStatusAt(0,4) == ScoreBoard.STATUS_GROUP_ALIVE);
	ok(scoreboard1.getGroupStatusAt(0,5) == ScoreBoard.STATUS_GROUP_DEAD);
	ok(scoreboard1.getGroupStatusAt(1,4) == ScoreBoard.STATUS_GROUP_ALIVE);
	ok(scoreboard1.getGroupStatusAt(4,0) == ScoreBoard.STATUS_GROUP_ALIVE);
	ok(scoreboard1.getGroupStatusAt(4,1) == ScoreBoard.STATUS_GROUP_ALIVE);
	ok(scoreboard1.getGroupStatusAt(5,0) == ScoreBoard.STATUS_GROUP_DEAD);
});


test("BoardExactAnalysis should find group connections", function(){

	var test_board1 = [
                [ e ,   B , e ,  WA , e , WD],
                [ e ,   e , B ,  e , WA , e ],
                [ B ,   B , e ,  e , e , e ],
                [ e ,   e , W , W , e , W ],
                [ B ,   B , W ,  e , e , W ],
                [ WD, e , W , W , e , W ]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findConnections();
	
	ok(scoreboard1.isSameMetaGroup(scoreboard1.getGroupNameAt(0, 1), scoreboard1.getGroupNameAt(1, 2)));
	ok(scoreboard1.isSameMetaGroup(scoreboard1.getGroupNameAt(0, 1), scoreboard1.getGroupNameAt(2, 0)));
	ok(scoreboard1.isSameMetaGroup(scoreboard1.getGroupNameAt(0, 1), scoreboard1.getGroupNameAt(4, 0)));
	ok(scoreboard1.isSameMetaGroup(scoreboard1.getGroupNameAt(1, 2), scoreboard1.getGroupNameAt(2, 1)));
	ok(scoreboard1.isSameMetaGroup(scoreboard1.getGroupNameAt(2, 1), scoreboard1.getGroupNameAt(4, 0)));

	ok(scoreboard1.isSameMetaGroup(scoreboard1.getGroupNameAt(0, 3), scoreboard1.getGroupNameAt(1, 4)));
	ok(!scoreboard1.isSameMetaGroup(scoreboard1.getGroupNameAt(0, 5), scoreboard1.getGroupNameAt(1, 4)));

	ok(scoreboard1.isSameMetaGroup(scoreboard1.getGroupNameAt(3, 3), scoreboard1.getGroupNameAt(3, 5)));


	var test_board2 = [
                [  e ,  B ,  e ,  e ,  e ,  e ],
                [  e ,  W , B ,  B ,  W ,  B ],
                [  e ,  W ,  B ,  W ,  e ,  W ],
                [  W , B ,  e ,  e ,  e ,  e ],
                [  B ,  e ,  B ,  W ,  e ,  W ],
                [  W , B ,  W ,  e ,  W ,  e ]
            ];

	var scoreboard2 = new BoardExactAnalysis(test_board2, 0.5, 0, 0);
	scoreboard2.findConnections();
	ok(scoreboard2.isSameMetaGroup(scoreboard2.getGroupNameAt(0, 1), scoreboard2.getGroupNameAt(1, 2)));
	ok(scoreboard2.isSameMetaGroup(scoreboard2.getGroupNameAt(1, 4), scoreboard2.getGroupNameAt(2, 3)));
	ok(scoreboard2.isSameMetaGroup(scoreboard2.getGroupNameAt(1, 4), scoreboard2.getGroupNameAt(2, 5)));
	ok(scoreboard2.isSameMetaGroup(scoreboard2.getGroupNameAt(3, 1), scoreboard2.getGroupNameAt(4, 2)));
	ok(scoreboard2.isSameMetaGroup(scoreboard2.getGroupNameAt(4, 3), scoreboard2.getGroupNameAt(4, 5)));
	ok(scoreboard2.isSameMetaGroup(scoreboard2.getGroupNameAt(4, 3), scoreboard2.getGroupNameAt(5, 4)));

	
});


test("BoardExactAnalysis should find simple eyes", function(){

	var test_board1 = [
                [ e ,  B ,  e ,  e , e ,  e],
                [ B ,  B ,  B ,  e , e ,  e],
                [ e ,  B ,  e ,  B , e ,  e],
                [ B ,  B ,  B ,  e , B ,  e],
                [ e ,  B ,  e ,  B , W ,  e],
                [ e ,  W ,  B ,  W , W ,  e]
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findConnections();
	scoreboard1.lookForSimpleEyeOrKo();
	
	ok(scoreboard1.isTerritoryPropAt(0, 0, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));
	ok(scoreboard1.isTerritoryPropAt(2, 0, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));
	ok(!scoreboard1.isTerritoryPropAt(4, 0, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));
	ok(!scoreboard1.isTerritoryPropAt(5, 0, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));
	ok(!scoreboard1.isTerritoryPropAt(0, 2, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));
	ok(scoreboard1.isTerritoryPropAt(2, 2, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));
	ok(!scoreboard1.isTerritoryPropAt(4, 2, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));
	ok(!scoreboard1.isTerritoryPropAt(3, 3, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));
	ok(!scoreboard1.isTerritoryPropAt(4, 5, BoardExactAnalysis.PROPERTY_TERRITORY_IS_EYE, true));


});


test("BoardExactAnalysis should find ko", function(){
	var test_board1 = [
                [  e ,  e ,  e ,  e ,  e ,  e ],
                [  e ,  B ,  W ,  e ,  e ,  e ],
                [  B ,  e ,  B ,  W ,  e ,  e ],
                [  e ,  B ,  W ,  e ,  e ,  W ],
                [  e ,  e ,  e ,  B ,  W ,  e ],
                [  e ,  e ,  B ,  e ,  B ,  W ],
            ];

	var scoreboard1 = new BoardExactAnalysis(test_board1, 0.5, 0, 0);
	scoreboard1.findConnections();
	scoreboard1.lookForSimpleEyeOrKo();

	var analysedBoard1 = scoreboard1.getBoardArray();
	var expected_result1 = [
                [  U ,  U ,  U ,  U ,  U ,  U ],
                [  U ,  B ,  W ,  U ,  U ,  U ],
                [  B ,  KB ,  B ,  W ,  U ,  U ],
                [  U ,  B ,  W ,  U ,  U ,  W ],
                [  U ,  U ,  U ,  B ,  W ,  KW ],
                [  U ,  U ,  B ,  KB ,  B ,  W ],
            ];

	ok(are_similar_boards(analysedBoard1, expected_result1));
 	
});
