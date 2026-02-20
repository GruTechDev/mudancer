<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Make optional lead fields nullable so admin can save with empty values.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('estado_origen')->nullable()->change();
            $table->string('localidad_origen')->nullable()->change();
            $table->string('colonia_origen')->nullable()->change();
            $table->string('estado_destino')->nullable()->change();
            $table->string('localidad_destino')->nullable()->change();
            $table->string('colonia_destino')->nullable()->change();
            $table->string('empaque')->nullable()->change();
            $table->date('fecha_recoleccion')->nullable()->change();
            $table->string('tiempo_estimado')->nullable()->change();
            $table->string('modalidad')->nullable()->change();
            $table->text('inventario')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('estado_origen')->nullable(false)->change();
            $table->string('localidad_origen')->nullable(false)->change();
            $table->string('colonia_origen')->nullable(false)->change();
            $table->string('estado_destino')->nullable(false)->change();
            $table->string('localidad_destino')->nullable(false)->change();
            $table->string('colonia_destino')->nullable(false)->change();
            $table->string('empaque')->nullable(false)->change();
            $table->date('fecha_recoleccion')->nullable(false)->change();
            $table->string('tiempo_estimado')->nullable(false)->change();
            $table->string('modalidad')->nullable(false)->change();
            $table->text('inventario')->nullable(false)->change();
        });
    }
};
