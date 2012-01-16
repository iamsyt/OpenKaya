#not real system, just for mock.
class Random

  attr_accessor :rounds, :players 

  def initialize(players)
    @players = players
    @rounds = []
  end

  def pairings
    @rounds.last.pairings
  end

  def do_pairings
    pairings = []
    matching_players = @players.dup
    index = 0
    (matching_players.length/2).times do 
      p1 = matching_players.pop
      p2 = matching_players.delete_at rand(matching_players.length)
      pairings << Pairing.new(p1,p2)
    end
    return pairings
  end

  def fixture
    res = ""
    @rounds.each do |round|
      res += "#{round.to_s}\n"
    end
    res         
  end

  def start_round
    raise "Not all games were played in the previous round." unless @rounds.empty? || @rounds.last.finished?
    @rounds << Round.new(do_pairings)
    
  end

  def add_result(p1,p2, result)
    @rounds.last.add_result(p1,p2,result)
  end

  def player_result(player)


  end
end

class Round

  attr_accessor :pairings

  def initialize(pairings)
    @pairings = pairings
  end

  def add_result(p1,p2, result)
    find_match_by_names(p1,p2).result = result
  end

  def finished?
    @pairings.each {|p| return false unless p.result}
    return true
  end

  def to_s
    res = ""
    @pairings.each do |pairing|
    end 
  end  

private

  def find_match_by_names(p1,p2)
    @pairings.each do |pairing|
      return pairing if (pairing.white_player == p1 && 
                        pairing.black_player == p2)
    end
  end
end

class Pairing
  attr_accessor :white_player, :black_player, :result
  def initialize(white_player, black_player)
    raise "Invalid players" if white_player.nil? || black_player.nil?
    @white_player= white_player
    @black_player = black_player
  end
end