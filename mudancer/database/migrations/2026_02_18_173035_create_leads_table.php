<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('lead_id')->unique();
            $table->string('nombre_cliente');
            $table->string('email_cliente');
            $table->string('telefono_cliente', 10);
            $table->string('estado_origen');
            $table->string('localidad_origen');
            $table->string('colonia_origen');
            $table->string('piso_origen')->nullable();
            $table->boolean('elevador_origen')->default(false);
            $table->integer('acarreo_origen')->unsigned()->default(30);
            $table->string('estado_destino');
            $table->string('localidad_destino');
            $table->string('colonia_destino');
            $table->string('piso_destino')->nullable();
            $table->boolean('elevador_destino')->default(false);
            $table->integer('acarreo_destino')->unsigned()->default(30);
            $table->string('empaque');
            $table->date('fecha_recoleccion');
            $table->string('tiempo_estimado');
            $table->string('modalidad');
            $table->decimal('seguro', 10, 2)->nullable();
            $table->text('inventario');
            $table->text('articulos_delicados')->nullable();
            $table->text('observaciones')->nullable();
            $table->boolean('publicada')->default(false);
            $table->boolean('adjudicada')->default(false);
            $table->boolean('concluida')->default(false);
            $table->boolean('vista')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
