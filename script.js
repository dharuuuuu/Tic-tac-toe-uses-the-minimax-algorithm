  // ------------------------
  // GLOBAL VARS
  // ------------------------
  
  var canvas,
      ctx,
      lebar_page,
      tinggi_page,
      ukuran_papan,
      lebar_papan,
      tinggi_papan,
      ukuran_kotak,
      offset_kotak,
      kotak,
      player_turn,
      player_first = 0,
      index_mouse,
      game_status;




// ------------------------
// KONFIGURASI
// ------------------------

var config = {
    margin_luar_kotak: 48,
    margin_dalam_kotak: 4,
    warna_background: "rgb(205, 76, 76)",
    warna_kotak: "rgb(255,255,255)",
    warna_gambar: "rgb(48,48,48)",
    warna_hover_gambar: "rgb(208,208,208)",
    warga_garis_menang: "rgba(255,48,48,0.6)",
    lebar_gambar: 8,
    lebar_garis_menang: 12,
  };
  
  
  
  // ------------------------
  // SETUP / INITIALIZATION
  // ------------------------
  
  function buat_canvas()
  {
    var body = document.getElementsByTagName('body')[0]; // mengambil tag "id" dan menyimpan dalam variabbel "body"
    
    canvas = document.createElement('canvas'); // membuat elemen canvas
    canvas.style.position = 'absolute'; // mengatur posisi canvas menjadi absolute
    canvas.style.top = canvas.style.left = canvas.style.bottom = canvas.style.right = 0; // mengatur margin canvas menjadi 0
    
    ctx = canvas.getContext('2d');
    body.appendChild(canvas);  
  }
  
  
  function ukuran_canvas()
  {
    lebar_page = canvas.width = window.innerWidth; // mengatur lebar canvas
    tinggi_page = canvas.height = window.innerHeight; // mengatur tinggi canvas
    
    ukuran_papan = Math.min(lebar_page, tinggi_page) - 2*config.margin_luar_kotak; // mengatur ukuran papan
    ukuran_kotak = Math.floor((ukuran_papan - 2*config.margin_dalam_kotak)/3); // mengatur ukuran kotak
    offset_kotak = ukuran_kotak+config.margin_dalam_kotak; // mengatur jarak antar kotak
    
    ukuran_papan = 3*ukuran_kotak + 2*config.margin_dalam_kotak;
    lebar_papan = Math.floor(lebar_page/2 - ukuran_papan/2); // mengatur lebar papan
    tinggi_papan = Math.floor(tinggi_page/2 - ukuran_papan/2); // mengatur tinggi papan
  }
  
  // mengatur fungsi siapa yang jalan duluan 
  function Init()
  {
    var i;
    
    kotak = [];
    for(i = 0; i < 9; i++)
    {
      kotak[i] = null;
    }
    
    game_status = { winner:null }; 
    player_turn = 1 - player_first;
    player_first = 1 - player_first;
    index_mouse = - 1;
  
    pergantian_giliran();
  }
  
  
  
  // ------------------------
  // CORE FUNCTIONS
  // ------------------------
  
  // fungsi untuk memasukan langkah
  function tambahkan_langkah(index,player)
  {
    kotak[index] = player;
    game_status = GetOutcomes(kotak);
    pergantian_giliran();
  }
  
  // fungsi untuk pergantian giliran
  function pergantian_giliran()
  {
    if (game_status.winner === null){
      player_turn = 1 - player_turn;
      if (player_turn === 1){      
        AI_move(kotak,player_turn);
      }
    }
    index_mouse = -1;
    draw();
  }  

  // fungsi untuk cek posisi mouse
  function cek_posisi_mouse(mouse_x, mouse_y, click)
  {
    var left,
        top,
        index = -1,
        i,
        j;
    
    for(i = 0; i < 3; i++)
    {
      for(j = 0; j < 3; j++)
      {
        left = lebar_papan + i*offset_kotak;
        top = tinggi_papan + j*offset_kotak;     
        if (kotak[koordinat_index(i,j)] === null && PointInRect(mouse_x, mouse_y, left, top, ukuran_kotak, ukuran_kotak))
        {        
          index = koordinat_index(i,j);
        }
      }
    }
    
    canvas.style.cursor = (index > -1)? 'pointer' : 'default';
    if (index_mouse !== index)
    {
      index_mouse = index;
      draw();
    }
    
    if (click && kotak[index]===null)
    {
      tambahkan_langkah(index, player_turn);
    }  
  }

  // fungsi untuk mencari langkah selanjutnya (mencari tempat yang masih kosong)
  function cari_langkah(papan)
  {
    var langkah = [],
        i;
    
    for(i = 0; i < 9; i++)
    {
      if (papan[i] === null)
      {
        langkah.push(i);
      }
    }  
    return (langkah.length > 0)? langkah : null;
  }

  function GetOutcomes(papan)
  {
    var i,
        kotak_kosong;
    
    // cek kondisi menang horizontal dan vertikal
    for(i = 0; i < 3; i++)
    {
      if (papan[koordinat_index(i,0)] !== null && 
          papan[koordinat_index(i,0)] === papan[koordinat_index(i,1)] &&
          papan[koordinat_index(i,0)] === papan[koordinat_index(i,2)])
      {
        return {
          winner: papan[koordinat_index(i,0)], 
          kotak: [ {x:i,y:0}, {x:i,y:1}, {x:i,y:2} ]
        };
      }

      if (papan[koordinat_index(0,i)] !== null && 
          papan[koordinat_index(0,i)] === papan[koordinat_index(1,i)] &&
          papan[koordinat_index(0,i)] === papan[koordinat_index(2,i)])
      {
        return {
          winner: papan[koordinat_index(0,i)], 
          kotak: [ {x:0,y:i}, {x:1,y:i}, {x:2,y:i} ]
        };
      }
    }
    
    // cek kondisi menang diagonal
    if (papan[koordinat_index(0,0)] !== null &&
        papan[koordinat_index(0,0)] === papan[koordinat_index(1,1)] &&
        papan[koordinat_index(0,0)] === papan[koordinat_index(2,2)])
    {
      return {
        winner: papan[koordinat_index(0,0)], 
        kotak: [ {x:0,y:0}, {x:1,y:1}, {x:2,y:2} ]
      };
    }

    if (papan[koordinat_index(0,2)] !== null &&
        papan[koordinat_index(0,2)] === papan[koordinat_index(1,1)] &&
        papan[koordinat_index(0,2)] === papan[koordinat_index(2,0)])
    {
      return {
        winner: papan[koordinat_index(0,2)], 
        kotak: [ {x:0,y:2}, {x:1,y:1}, {x:2,y:0} ]
      };
    }
    
    // jika belum ada pemenang, cari kotak yang masih kosong
    kotak_kosong = cari_langkah(papan);
    
    // jika masih ada kotak kosong, permainan belum berakhir
    if (kotak_kosong)
    {
      return {
        winner: null,
        kotak: kotak_kosong
      };
    }

    else
    {
      return { 
        winner: -1,
        kotak: null
      };
    }
  }




  // -------------------------------
  // MENGATUR AI / ALGORITMA MINIMAX
  // -------------------------------
  
  function AI_move(papan, player)
  {
    var outcomes = GetOutcomes(papan),
        langkah_terbaik,
        best_alpha_beta = -2,
        test_alpha_beta,
        test_papan,
        i;
  
    for(i = 0; i < outcomes.kotak.length; i++)
    {      
      test_papan = papan.slice(0);
      test_papan[outcomes.kotak[i]] = player;
      test_alpha_beta = alpha_beta(test_papan, -999, 999, player, false);
  
      if (test_alpha_beta > best_alpha_beta)
      {
        langkah_terbaik = outcomes.kotak[i];
        best_alpha_beta = test_alpha_beta;
      }
    }
  
    tambahkan_langkah(langkah_terbaik,player);
  };
  
  function alpha_beta(papan, a, b, player, maximizing_player)
  {
    var i,
        outcome = GetOutcomes(papan),
        child_board;
  
    if (outcome.winner !== null)
    {
      if (outcome.winner === player){ return 1; }
      else if (outcome.winner === 1-player){ return -1; }
      else{ return 0; }
    }
  
    if (maximizing_player)
    {
      for(i = 0; i < outcome.kotak.length; i++)
      {
        child_board = papan.slice(0);
        child_board[outcome.kotak[i]] = player;
        a = Math.max(a, alpha_beta(child_board, a, b, player, false));
        if(b <= a)
        {
          break;
        }
      }
      return a;   
    }

    else{
      for(i = 0; i < outcome.kotak.length; i++)
      {
        child_board = papan.slice(0);
        child_board[outcome.kotak[i]] = 1-player;
        b = Math.min(b, alpha_beta(child_board, a, b, player, true));
        if (b <= a)
        {
          break;
        }
      }
      return b;
    }
  };

  
  // ------------------------
  // DRAW FUNCTIONS
  // ------------------------
  
  function draw(){
    var left,
        top,
        hover,
        i,
        j,
        index;
    
    ctx.fillStyle = config.warna_background;
    ctx.fillRect(0, 0, lebar_page, tinggi_page);  
    
    for(i = 0; i < 3; i++)
    {
      for(j = 0; j < 3; j++)
      {
        left = lebar_papan + i*offset_kotak;
        top = tinggi_papan + j*offset_kotak;
        index = koordinat_index(i,j);
        hover = (index === index_mouse);      
        
        draw_kotak(kotak[index], left, top, ukuran_kotak, hover);
      }
    }

    if (game_status.winner === 0 || game_status.winner === 1){ gambar_garis(); }
  }
  
  
  function draw_kotak(player, left, top, size, moused)
  {
    ctx.fillStyle = config.warna_kotak;
    ctx.fillRect(left, top, ukuran_kotak, ukuran_kotak);
    
    if (player === 0 || (player_turn === 0 && moused))
    {
      draw_x(left, top, size);
    }

    else if (player === 1 || (player_turn === 1 && moused))
    {
      draw_o(left, top, size);
    }

    else 
    {
      return;
    }

    ctx.lineWidth = (ukuran_kotak/100) * config.lebar_gambar;
    ctx.strokeStyle = (moused && player===null)? config.warna_hover_gambar : config.warna_gambar;
    ctx.stroke();
  }

  function draw_x(left, top, size){
    var x1 = left + 0.2*size,
        x2 = left + 0.8*size,
        y1 = top + 0.2*size,
        y2 = top + 0.8*size;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.moveTo(x1, y2);
    ctx.lineTo(x2, y1);
  }
  
  
  function draw_o(left, top, size){
    var x = left + 0.5*size,
        y = top + 0.5*size,
        rad = 0.3*size;
    
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, 2*Math.PI, false);
  }
  
  
  function gambar_garis(){
    var x1 = lebar_papan + game_status.kotak[0].x*offset_kotak + 0.5*ukuran_kotak,      
        x2 = lebar_papan + game_status.kotak[2].x*offset_kotak + 0.5*ukuran_kotak,      
        y1 = tinggi_papan + game_status.kotak[0].y*offset_kotak + 0.5*ukuran_kotak,
        y2 = tinggi_papan + game_status.kotak[2].y*offset_kotak + 0.5*ukuran_kotak,
        x_mod = 0.2*(x2-x1),
        y_mod = 0.2*(y2-y1);
    
    x1 -= x_mod;
    x2 += x_mod;
    
    y1 -= y_mod;
    y2 += y_mod;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    ctx.lineWidth = (ukuran_kotak/100) * config.lebar_garis_menang;
    ctx.strokeStyle = config.warga_garis_menang;
    ctx.stroke();
  }
  

  // ------------------------
  // HELPER FUNCTIONS
  // ------------------------
  
  function PointInRect(pX, pY, rL, rT, rW, rH){
    return (pX>rL && pX<rL+rW && pY>rT && pY<rT+rW);
  }

  function koordinat_index(x,y){
    return x + 3*y;
  }
  



  // ------------------------
  // EVENT HANDLERS/LISTENERS
  // ------------------------
  
  function on_load(){
    buat_canvas();
    ukuran_canvas();
    Init();
  }
  
  function on_resize(){
    ukuran_canvas();
    draw();
  }
  
  function on_mouse_move(e){
    if (player_turn === 0){
      cek_posisi_mouse(e.clientX, e.clientY);
    }
  }
  
  function on_mouse_down(e){
    if (game_status.winner !== null){
      Init();
    }
    else if (player_turn === 0){
      cek_posisi_mouse(e.clientX, e.clientY, true);
    }
  }
  
  function on_key_down(e){
    var key = event.keyCode || event.which;
    switch (key){
      case 27:
      case 82: Init(); break;
      default: break;
    }
  }
  
  
  window.addEventListener('load',on_load,false);
  window.addEventListener('resize',on_resize,false);
  window.addEventListener('mousemove',on_mouse_move,false);
  window.addEventListener('mousedown',on_mouse_down,false);
  window.addEventListener('keydown',on_key_down,false);