function vp_main($scope)
{
	var gAccount = new AuthAccount();
	gAccount.authClientID = '604779244106-2altleqgj8a1nibdst2dbr5gqjdrv7ok.apps.googleusercontent.com';  // vp
	gAccount.authScope = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.appdata';

	var gAppData = new AuthAppData();
	gAppData.file_name = "settings001.json";
	gAppData.setDefault({banner_text: "visual-planner", vipconfig: new VipGridConfig()});

	$scope.multi_col_count_options = {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 8: 8, 10: 10, 12: 12};
	$scope.settings = gAppData.getAppData();
	$scope.signed_in = false;
	$scope.busy = false;
	$scope.sign_msg = "Signing In...";
	$scope.g_signbtn_ok = true;

	gAccount.onSignIn = function() {
		$scope.sign_msg = gAccount.getEmail();
		$scope.$apply();
		ReadAppdata();
	}

	gAccount.onSignOut = function() {
		gAppData.setAppData(null);
		$scope.settings = gAppData.getAppData();
		$scope.form.$setPristine(true);
		$scope.sign_msg = "Signed Out";
		$scope.signed_in = false;
		$scope.view = 'grid';
		$scope.$apply();
		initGrid();
	}

	gAccount.onError = function(msg) {
		alert("Account Error: " + msg);
	}

	gAccount.Connect();

	$scope.onclickSettings = function() {
		$scope.view = 'settings';
		$scope.g_signbtn_ok = (document.getElementById("g_signbtn").textContent.length > 0);
	}

	$scope.onclickSignIn = function() {
		gAccount.SignIn();
	}

	$scope.onclickSignOut = function() {
		gAccount.SignOut();
	}

	$scope.onclickSave = function() {
		$scope.busy = true;
		WriteAppdata();
	}

	$scope.onclickCancel = function() {
		$scope.settings = gAppData.getAppData();
		$scope.form.$setPristine(true);
		$scope.view = 'grid';
	}

	function ReadAppdata() {
		gAppData.Read(
			function() {
				$scope.settings = gAppData.getAppData();
				$scope.form.$setPristine(true);
				$scope.signed_in = true;
				$scope.view = 'grid';
				$scope.$apply();
				initGrid();
			},
			function() {alert("Error loading settings.");}
		);
	}

	function WriteAppdata() {
		gAppData.Write(
			$scope.settings,
			function() {
				$scope.busy = false;
				$scope.form.$setPristine(true);
				$scope.view = 'grid';
				$scope.$apply();
				initGrid();
			},
			function() {alert("Error saving settings.");}
		);
	}

	function initGrid() {
		document.title = gAppData.getAppData().banner_text;

		var vg = new VipGrid("grid", "calendarbar");

		if ($scope.signed_in)
		{
			var gCal = new AuthCal();
			gCal.onError = onCalError;

			vg.registerEventSource(gCal);
		}

		vg.cfg = gAppData.getAppData().vipconfig;
		vg.init();
	}

	var cal_error_notified = false;
	function onCalError(msg) {
		if (cal_error_notified)
			return;

		alert("Error loading calendar events.\n\nPlease reload the page.\n\n" + msg);
		ga_hit("calendar_error", msg);

		cal_error_notified = true;
	}
}
