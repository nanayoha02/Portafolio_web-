async function guardarProyecto(e) {
    e.preventDefault();

    const archivo = document.getElementById('imagen_file').files[0];
    let urlImagen = "";

    // 1. Si hay un archivo seleccionado, lo subimos a Storage
    if (archivo) {
        const nombreArchivo = `${Date.now()}_${archivo.name}`; // Nombre único
        
        const { data: uploadData, error: uploadError } = await _supabase.storage
            .from('proyectos-imagenes')
            .upload(nombreArchivo, archivo);

        if (uploadError) {
            return alert("Error al subir imagen: " + uploadError.message);
        }

        // 2. Obtenemos la URL pública del archivo subido
        const { data: publicUrlData } = _supabase.storage
            .from('proyectos-imagenes')
            .getPublicUrl(nombreArchivo);
            
        urlImagen = publicUrlData.publicUrl;
    }

    // 3. Ahora guardamos todo en la tabla de la base de datos
    const proyectoData = {
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        tecnologias: document.getElementById('tecnologias').value,
        progreso: parseInt(document.getElementById('progreso').value),
        github_url: document.getElementById('github_url').value,
        web_url: document.getElementById('web_url').value,
        imagen_url: urlImagen // Aquí guardamos la URL que generamos arriba
    };

    const { error } = await _supabase.from('proyectos').insert([proyectoData]);

    if (error) {
        alert("Error al guardar: " + error.message);
    } else {
        alert("¡Proyecto publicado con éxito!");
        location.reload(); // Recargar para ver los cambios
    }
}