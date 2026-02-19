<?php

use App\Http\Controllers\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Admin\ProviderController as AdminProviderController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\LeadController;
use Illuminate\Support\Facades\Route;

Route::post('webhook/wpforms', [LeadController::class, 'receiveFromWPForms']);

Route::prefix('admin')->group(function () {
    Route::post('login', [AuthController::class, 'adminLogin']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('leads', [AdminLeadController::class, 'index']);
        Route::get('leads/{id}', [AdminLeadController::class, 'show']);
        Route::put('leads/{id}', [AdminLeadController::class, 'update']);
        Route::post('leads/{id}/publish', [AdminLeadController::class, 'publish']);
        Route::post('leads/{id}/adjudicar', [AdminLeadController::class, 'adjudicar']);
        Route::post('leads/{id}/concluir', [AdminLeadController::class, 'concluir']);

        Route::apiResource('providers', AdminProviderController::class);
    });
});
