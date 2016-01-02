var app = angular.module('taco', []);

app.controller('AlimentosCtrl', function($scope, $http) {
    $scope.searchFilter = '';
    $scope.sortField = 'nome';
    $scope.sortReverse = false;

    $http.get('dados/conteudo.json')
        .success(function(data, status, headers, config) {
            $scope.alimentos = data;
        });

    $scope.sort = function(field) {
        $scope.sortField = field;
        $scope.sortReverse = !$scope.sortReverse;
    }
});