<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'description', 'head_id'];

    public function head()
    {
        return $this->belongsTo(User::class, 'head_id');
    }

    public function teams()
    {
        return $this->hasMany(Team::class);
    }

    public function employees()
    {
        return $this->hasMany(EmployeeProfile::class);
    }
}
