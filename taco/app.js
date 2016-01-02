var app = angular.module('taco', []);

app.controller('AlimentosCtrl', function($scope, $http) {
    $scope.searchFilter = '';

    $http.get('dados/conteudo.json')
        .success(function(data, status, headers, config) {
            $scope.alimentos = data;
        });
});