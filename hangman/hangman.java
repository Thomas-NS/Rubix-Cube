import java.util.*;
import java.net.*;
import java.io.*;

public class hangman {
	public static Scanner sc = new Scanner(System.in);

	public static void main(String[]args) {
		try{	
			URL url = new URL("https://www.mit.edu/~ecprice/wordlist.10000");
			BufferedReader rd = new BufferedReader(new InputStreamReader(url.openStream()));
			int inputSize = 10000;
			String[] words = new String[inputSize];

			for(int i = 0; i < inputSize; i++) {
				words[i] = rd.readLine();
			}
	        rd.close();

	        gameStart(words, inputSize);
	    }
	    catch(Exception e) {
	    	System.err.println(e);
	    }
	}

	public static void gameStart(String[] words, int inputSize) {
		Random rand = new Random();
		int wordLength = 0;
		String word = "";

		System.out.println("Enter a number from 3-15. Enter 0 if you want a random length.");

		while(true) {
			if(sc.hasNextInt()) {
				wordLength = sc.nextInt();
				if(wordLength >= 3 && wordLength <= 15 || wordLength == 0) {
					break;
				}
				else {
					System.out.println("INVALID INPUT. Enter a number from 1-15. Enter 0 if you want a random length.");
				}
			}
			else {
				System.out.println("INVALID INPUT. Enter a number from 1-15. Enter 0 if you want a random length.");
				sc.next();
			}
		}

		if(wordLength != 0){
			while(word.length() != wordLength) {
				word = words[rand.nextInt(inputSize)];
			}
		}
		else {
			word = words[rand.nextInt(inputSize)];
		}

		playGame(word);
	}

	public static void playGame(String word) {
		String hiddenWord = "";
		String hangman = "";
		int wordLength = word.length();
		int guessesLeft = 7;
		boolean gameWon = false;
		ArrayList<Character> lettersGuessed = new ArrayList<Character>(); 
		ArrayList<Character> incorrectGuesses = new ArrayList<Character>(); 

		for(int i = 0; i < wordLength; i++) {
			hiddenWord += "_";
			if(i != wordLength-1) hiddenWord += " ";
		}

		while(guessesLeft > 0 && !gameWon) {
			hangman = getCurrentState(guessesLeft);

			System.out.println("\n---------------------------------------------------------------------------------");
			System.out.println(hangman);
			if(incorrectGuesses.size() > 0) {
				System.out.println("Incorrect guesses: " + incorrectGuesses.toString() + "\n");
			}
			System.out.println(hiddenWord);
			System.out.println("\nEnter your guess. You have " + guessesLeft + " incorrect guesses remaining.\n");

			char guess = getGuess(lettersGuessed);
			if(word.indexOf(guess) == -1) { 
				guessesLeft--;
				incorrectGuesses.add(guess);
			}
			else { 
				hiddenWord = getIndex(word, guess, hiddenWord);
			}

			String guessedWord = hiddenWord.replaceAll("\\s", "");
			gameWon = guessedWord.equals(word);
		}

	    if(guessesLeft == 0) { 
	    	System.out.println("\nGAME OVER! The word was: " + word);
	    }
	    else {
	    	System.out.println("\nYOU WIN! The word was: " + word); 
	    }
	}

	public static String getCurrentState(int guessesLeft) {
		switch(guessesLeft) {
				case 0:
					return "_______\n |     | \n |     | \n |    [ ] \n |    /|\\ \n |     | \n |    / \\ \n | \n";
				case 1:
					return "_______\n |     | \n |     | \n |    [ ] \n |    /|\\ \n |     | \n |    /  \n | \n";
				case 2:
					return "_______\n |     | \n |     | \n |    [ ] \n |    /|\\ \n |     | \n |  \n | \n";
				case 3:
					return "_______\n |     | \n |     | \n |    [ ] \n |    /|\\ \n | \n | \n | \n";
				case 4:
					return "_______\n |     | \n |     | \n |    [ ] \n |    /| \n | \n | \n | \n";
				case 5:
					return "_______\n |     | \n |     | \n |    [ ] \n |     | \n | \n | \n | \n";
				case 6:
					return "_______\n |     | \n |     | \n |    [ ] \n | \n | \n | \n | \n";
				case 7:
					return "_______\n |     | \n |     | \n | \n | \n | \n | \n | \n";
		}
		return "";
	}

	public static char getGuess(ArrayList<Character> lettersGuessed) {
		char guess = '$';
		while(true) {
			if(sc.hasNextLine()){
				String input = sc.nextLine().trim();
				if(input.length() == 0) {
					input = sc.nextLine();
				}
				if(input.trim().length() == 1 && Character.isLetter(input.charAt(0)) && !lettersGuessed.contains(input.charAt(0))) {
					guess = input.toLowerCase().charAt(0);
					lettersGuessed.add(guess);
					break;
				}
				else {
					System.out.println("INVALID INPUT. Enter an unused single alphabetical character\n");
				}
			}
		}
		return guess;
	}

	public static String getIndex(String word, char guess, String hiddenWord) {
		StringBuilder updatedHiddenWord = new StringBuilder(hiddenWord);
		ArrayList<Integer> guessIndexes = new ArrayList<Integer>();
		int index = word.indexOf(guess);
		while (index >= 0) {
    		guessIndexes.add(index);
    		index = word.indexOf(guess, index + 1);
		}

		for(int i = 0; i < guessIndexes.size(); i++) {
			if(guessIndexes.get(i) != 0){ 
				updatedHiddenWord.setCharAt(guessIndexes.get(i)*2, guess);
			}
			else {
				updatedHiddenWord.setCharAt(guessIndexes.get(i), guess);
			}
		}
		return updatedHiddenWord.toString();
	}

} 

